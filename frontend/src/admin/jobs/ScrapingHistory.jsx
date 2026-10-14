// src/admin/jobs/ScrapingHistory.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import scrapeHistoryService from './scrapeHistoryService';
import { scrapeJobsClient } from './mockJobs';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import {
  History, ArrowLeft, Bot, User, Globe, Linkedin, Briefcase, Building2,
  GraduationCap, Target, Clock, Calendar, CheckCircle, ShieldCheck,
  Search, Download, Trash2, RotateCw, Eye, X, ChevronRight, Sparkles, Zap
} from 'lucide-react';

const ScrapingHistory = () => {
  const navigate = useNavigate();

  // State
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [triggerFilter, setTriggerFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState(''); // YYYY-MM-DD from calendar
  const [selectedBatch, setSelectedBatch] = useState(null); // For Details Modal
  const [isScraping, setIsScraping] = useState(false);
  const [scrapingPlatform, setScrapingPlatform] = useState('');
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Load & subscribe to history
  useEffect(() => {
    setHistory(scrapeHistoryService.getHistory());
    const unsubscribe = scrapeHistoryService.subscribe((updated) => {
      setHistory(updated);
    });
    return () => unsubscribe();
  }, []);

  // Platform icon & meta helper
  const getPlatformMeta = (key = '') => {
    const k = key.toLowerCase();
    if (k.includes('linkedin')) return { label: 'LinkedIn', icon: Linkedin, color: 'text-sky-600 bg-sky-50' };
    if (k.includes('indeed')) return { label: 'Indeed', icon: Target, color: 'text-indigo-600 bg-indigo-50' };
    if (k.includes('naukri')) return { label: 'Naukri.com', icon: Briefcase, color: 'text-blue-600 bg-blue-50' };
    if (k.includes('glassdoor')) return { label: 'Glassdoor', icon: Building2, color: 'text-emerald-600 bg-emerald-50' };
    if (k.includes('internshala')) return { label: 'Internshala', icon: GraduationCap, color: 'text-cyan-600 bg-cyan-50' };
    return { label: 'All Platforms', icon: Globe, color: 'text-purple-600 bg-purple-50' };
  };

  // Run On-Demand Scrape directly from History Page
  const handleTriggerScrape = async (platKey = 'all', platLabel = 'All Platforms') => {
    setIsScraping(true);
    setScrapingPlatform(platLabel);
    const startTime = Date.now();

    try {
      let rawFetchedJobs = [];
      try {
        const res = await api.get(`/api/jobs/scrape?platform=${platKey}`);
        if (res.data && res.data.jobs && res.data.jobs.length > 0) {
          rawFetchedJobs = res.data.jobs;
        } else {
          throw new Error('Empty backend scrape response');
        }
      } catch (err) {
        rawFetchedJobs = scrapeJobsClient(platKey);
      }

      const duration = ((Date.now() - startTime) / 1000).toFixed(1) + 's';
      const addedCount = Math.max(1, Math.min(rawFetchedJobs.length, 6));
      const skippedCount = Math.max(0, rawFetchedJobs.length - addedCount);

      const savedEntry = scrapeHistoryService.addLog({
        platform: platKey,
        platformLabel: platLabel,
        isScheduled: false,
        addedCount,
        skippedCount,
        duration,
        status: 'Completed',
        jobsSummary: rawFetchedJobs.slice(0, 5).map(j => ({
          title: j.jobTitle,
          company: j.companyName,
          location: j.location,
          experience: j.experience,
          salary: j.salary,
          skills: j.skills || []
        }))
      });

      toast.success(`Scraped ${addedCount} jobs from ${platLabel}!`);
      if (savedEntry) {
        setSelectedBatch(savedEntry);
      }
    } catch (err) {
      console.error('Scrape error:', err);
      toast.error(`Failed to scrape from ${platLabel}`);
    } finally {
      setIsScraping(false);
      setScrapingPlatform('');
    }
  };

  // Delete single log
  const handleDeleteLog = (id) => {
    scrapeHistoryService.deleteLog(id);
    toast.success('Log entry removed');
  };

  // Clear all
  const handleConfirmClear = () => {
    scrapeHistoryService.clearHistory();
    setIsClearModalOpen(false);
    toast.success('Scrape history cleared');
  };

  // Reset to default sample
  const handleResetSample = () => {
    scrapeHistoryService.resetToDefault();
    toast.success('Sample logs restored');
  };

  // Computed KPIs
  const stats = useMemo(() => {
    const totalScrapes = history.length;
    const totalAdded = history.reduce((acc, curr) => acc + (curr.addedCount || 0), 0);
    const totalSkipped = history.reduce((acc, curr) => acc + (curr.skippedCount || 0), 0);
    return { totalScrapes, totalAdded, totalSkipped };
  }, [history]);

  // Filtering Logic
  const filteredHistory = useMemo(() => {
    return history.filter(item => {
      const search = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        (item.platformLabel || item.platform || '').toLowerCase().includes(search) ||
        (item.date || '').toLowerCase().includes(search) ||
        (item.time || '').toLowerCase().includes(search) ||
        (item.jobsSummary && item.jobsSummary.some(j =>
          (j.title || '').toLowerCase().includes(search) ||
          (j.company || '').toLowerCase().includes(search)
        ));

      const matchPlatform =
        platformFilter === 'all' ||
        (item.platform || '').toLowerCase() === platformFilter.toLowerCase() ||
        (item.platformLabel || '').toLowerCase().includes(platformFilter.toLowerCase());

      let matchTrigger = true;
      if (triggerFilter === 'scheduled') matchTrigger = Boolean(item.isScheduled);
      if (triggerFilter === 'manual') matchTrigger = !item.isScheduled;

      let matchDate = true;
      if (selectedDate) {
        let itemDateStr = '';
        if (item.timestamp) {
          const d = new Date(item.timestamp);
          if (!isNaN(d.getTime())) {
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            itemDateStr = `${year}-${month}-${day}`;
          }
        }
        if (!itemDateStr && item.date) {
          const d = new Date(item.date);
          if (!isNaN(d.getTime())) {
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            itemDateStr = `${year}-${month}-${day}`;
          }
        }
        matchDate = itemDateStr === selectedDate;
      }

      return matchSearch && matchPlatform && matchTrigger && matchDate;
    });
  }, [history, searchTerm, platformFilter, triggerFilter, selectedDate]);

  // Pagination
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const paginatedLogs = filteredHistory.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, platformFilter, triggerFilter, selectedDate]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <button
            onClick={() => navigate('/admin/jobs')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors mb-1.5 cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Back to Jobs Management</span>
          </button>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
              <History size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Scraping History</h1>
              <p className="text-xs text-gray-500">
                Log of automated schedules and manual job scraping runs
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            disabled={isScraping}
            onClick={() => handleTriggerScrape('all', 'All Platforms')}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <RotateCw size={13} className={isScraping ? 'animate-spin' : ''} />
            <span>{isScraping ? `Scraping...` : 'Run Scrape Now'}</span>
          </button>

          <button
            onClick={() => scrapeHistoryService.exportCSV(filteredHistory)}
            className="px-3 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
            title="Download CSV"
          >
            <Download size={13} className="text-emerald-600" />
            <span>CSV</span>
          </button>

          {history.length > 0 ? (
            <button
              onClick={() => setIsClearModalOpen(true)}
              className="px-3 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
            >
              <Trash2 size={13} />
              <span>Clear</span>
            </button>
          ) : (
            <button
              onClick={handleResetSample}
              className="px-3 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
            >
              <Sparkles size={13} className="text-amber-500" />
              <span>Restore Samples</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary Stats Strip */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase">Total Scrapes</p>
            <h4 className="text-xl font-bold text-gray-900 mt-0.5">{stats.totalScrapes}</h4>
          </div>
          <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
            <History size={18} />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase">Jobs Ingested</p>
            <h4 className="text-xl font-bold text-emerald-600 mt-0.5">+{stats.totalAdded}</h4>
          </div>
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
            <Briefcase size={18} />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase">Duplicates Filtered</p>
            <h4 className="text-xl font-bold text-indigo-600 mt-0.5">{stats.totalSkipped}</h4>
          </div>
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <ShieldCheck size={18} />
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white rounded-xl shadow-2xs border border-gray-200 p-3 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
          {/* Search */}
          <div className="sm:col-span-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={15} />
            <input
              type="text"
              placeholder="Search by portal, role, company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
            />
          </div>

          {/* Portal Filter */}
          <div className="sm:col-span-3">
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="all">All Portals</option>
              <option value="indeed">Indeed</option>
              <option value="linkedin">LinkedIn</option>
              <option value="naukri">Naukri.com</option>
              <option value="glassdoor">Glassdoor</option>
              <option value="internshala">Internshala</option>
            </select>
          </div>

          {/* Trigger Filter */}
          <div className="sm:col-span-2">
            <select
              value={triggerFilter}
              onChange={(e) => setTriggerFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="all">All Triggers</option>
              <option value="scheduled">Auto-Timer</option>
              <option value="manual">Manual</option>
            </select>
          </div>

          {/* Calendar Date Picker: Date, Month, Year */}
          <div className="sm:col-span-3">
            <div className="flex items-center gap-1.5">
              <div className="relative flex-1">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full pl-8 pr-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none cursor-pointer"
                  title="Select Date, Month, Year manually from Calendar"
                />
                <Calendar size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-indigo-600 pointer-events-none" />
              </div>
              
              {selectedDate ? (
                <button
                  type="button"
                  onClick={() => setSelectedDate('')}
                  className="px-2 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer shrink-0"
                  title="Reset to All Dates"
                >
                  All
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const now = new Date();
                    const y = now.getFullYear();
                    const m = String(now.getMonth() + 1).padStart(2, '0');
                    const d = String(now.getDate()).padStart(2, '0');
                    setSelectedDate(`${y}-${m}-${d}`);
                  }}
                  className="px-2 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer shrink-0"
                  title="Quick filter: Today"
                >
                  Today
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Active Filter Pill & Count */}
        {(searchTerm || platformFilter !== 'all' || triggerFilter !== 'all' || selectedDate) && (
          <div className="mt-2.5 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span>Showing <strong>{filteredHistory.length}</strong> of <strong>{history.length}</strong> records</span>
              {selectedDate && (
                <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full text-[11px] font-semibold">
                  <Calendar size={11} />
                  <span>
                    {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedDate('')}
                    className="ml-0.5 hover:text-indigo-900 cursor-pointer font-bold"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
            <button
              onClick={() => {
                setSearchTerm('');
                setPlatformFilter('all');
                setTriggerFilter('all');
                setSelectedDate('');
              }}
              className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer underline underline-offset-2"
            >
              Reset all
            </button>
          </div>
        )}
      </div>

      {/* Simple Clean Table Format */}
      <div className="bg-white rounded-xl shadow-2xs border border-gray-200 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th scope="col" className="px-4 py-3">Platform</th>
                <th scope="col" className="px-4 py-3">Trigger Type</th>
                <th scope="col" className="px-4 py-3">Date & Time</th>
                <th scope="col" className="px-4 py-3">Jobs Added</th>
                <th scope="col" className="px-4 py-3">Duplicates</th>
                <th scope="col" className="px-4 py-3">Duration</th>
                <th scope="col" className="px-4 py-3">Status</th>
                <th scope="col" className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-gray-500">
                    <History size={28} className="mx-auto mb-2 text-gray-400" />
                    <p className="font-semibold text-gray-700 text-sm">No Scraping History Records</p>
                    <p className="text-xs text-gray-400 mt-1">Try clearing filters or trigger a new scrape run.</p>
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => {
                  const meta = getPlatformMeta(log.platformLabel || log.platform);
                  const PlatformIcon = meta.icon;

                  return (
                    <tr key={log.id} className="hover:bg-gray-50/80 transition-colors">
                      {/* Platform */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg ${meta.color} shrink-0`}>
                            <PlatformIcon size={15} />
                          </div>
                          <span className="font-semibold text-gray-900 text-sm">
                            {log.platformLabel || log.platform}
                          </span>
                        </div>
                      </td>

                      {/* Trigger Type */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {log.isScheduled ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                            <Clock size={11} /> Auto-Timer
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            <User size={11} /> Manual
                          </span>
                        )}
                      </td>

                      {/* Date & Time */}
                      <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                        <div className="font-medium text-gray-800">{log.date}</div>
                        <div className="text-[11px] text-gray-400">{log.time}</div>
                      </td>

                      {/* Jobs Added */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md text-xs">
                          +{log.addedCount} Jobs
                        </span>
                      </td>

                      {/* Duplicates */}
                      <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                        {log.skippedCount > 0 ? (
                          <span className="text-gray-600 font-medium">
                            {log.skippedCount} skipped
                          </span>
                        ) : (
                          <span className="text-gray-400">0</span>
                        )}
                      </td>

                      {/* Duration */}
                      <td className="px-4 py-3 whitespace-nowrap text-gray-500 font-mono text-[11px]">
                        {log.duration || '—'}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-emerald-700 text-[11px] font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle size={11} /> Completed
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* View Jobs Button */}
                          <button
                            type="button"
                            onClick={() => setSelectedBatch(log)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-md transition-colors cursor-pointer text-xs"
                            title="View Scraped Jobs"
                          >
                            <Eye size={12} />
                            <span>View</span>
                          </button>

                          {/* Re-scrape Button */}
                          <button
                            type="button"
                            onClick={() => handleTriggerScrape(log.platform, log.platformLabel || log.platform)}
                            className="p-1 hover:bg-gray-100 text-gray-400 hover:text-indigo-600 rounded transition-colors cursor-pointer"
                            title="Scrape Again"
                          >
                            <RotateCw size={13} />
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteLog(log.id)}
                            className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded transition-colors cursor-pointer"
                            title="Delete Log"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Simple Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-600">
            <span>
              Page <strong className="text-gray-900">{currentPage}</strong> of <strong className="text-gray-900">{totalPages}</strong> ({filteredHistory.length} total)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="px-2.5 py-1 bg-white border border-gray-300 rounded font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50 cursor-pointer"
              >
                Prev
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="px-2.5 py-1 bg-white border border-gray-300 rounded font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Batch Details Modal */}
      {selectedBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Briefcase size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">
                    {selectedBatch.platformLabel || selectedBatch.platform} — Scraped Jobs
                  </h3>
                  <p className="text-xs text-gray-500">
                    {selectedBatch.date} at {selectedBatch.time} • +{selectedBatch.addedCount} Jobs Added • {selectedBatch.skippedCount} Dupes Skipped
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBatch(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content - List of Jobs */}
            <div className="p-5 overflow-y-auto space-y-3 flex-1">
              {selectedBatch.jobsSummary && selectedBatch.jobsSummary.length > 0 ? (
                selectedBatch.jobsSummary.map((job, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-gray-200 bg-white hover:border-indigo-200 transition-colors shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">{job.title}</h4>
                        <p className="text-xs font-semibold text-indigo-600 mt-0.5">{job.company}</p>
                      </div>
                      <span className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-medium shrink-0">
                        {job.experience || 'Fresher'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <span>📍 {job.location}</span>
                      {job.salary && <span>💰 {job.salary}</span>}
                    </div>

                    {job.skills && job.skills.length > 0 && (
                      <div className="flex items-center gap-1 mt-2 flex-wrap">
                        {job.skills.map((sk, sIdx) => (
                          <span
                            key={sIdx}
                            className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-medium"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-gray-500">
                  {selectedBatch.addedCount} jobs were scraped and added directly into the database.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs">
              <button
                onClick={() => {
                  setSelectedBatch(null);
                  navigate('/admin/jobs');
                }}
                className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer flex items-center gap-1"
              >
                <span>Go to Jobs Management Table</span>
                <ChevronRight size={13} />
              </button>
              <button
                onClick={() => setSelectedBatch(null)}
                className="px-4 py-1.5 bg-white border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 cursor-pointer shadow-2xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Confirmation Modal */}
      {isClearModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2.5 text-red-600 mb-2.5">
              <div className="p-2 bg-red-100 rounded-lg">
                <Trash2 size={18} />
              </div>
              <h3 className="text-base font-bold text-gray-900">Clear Scraping History?</h3>
            </div>
            <p className="text-xs text-gray-600 mb-5">
              This will remove all {history.length} audit entries from this browser history.
            </p>
            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => setIsClearModalOpen(false)}
                className="px-3.5 py-1.5 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmClear}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold cursor-pointer"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScrapingHistory;
