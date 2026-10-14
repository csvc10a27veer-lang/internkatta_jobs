import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { initialJobs, scrapeJobsClient } from './mockJobs';
import JobDetailsModal from './JobDetailsModal';
import JobFormModal from './JobFormModal';
import AutoScheduleModal from './AutoScheduleModal';
import AutoScrapeHistoryModal from './AutoScrapeHistoryModal';
import scrapeHistoryService from './scrapeHistoryService';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { 
  Search, Briefcase, Building2, MapPin, Edit, Eye, Trash2, 
  Plus, CheckCircle, XCircle, AlertTriangle, ChevronLeft, ChevronRight,
  Bot, User, Globe, Linkedin, GraduationCap, ChevronDown, Loader2, Sparkles, 
  ExternalLink, RefreshCw, Target, Clock, Play, Pause, Settings, History, 
  ShieldCheck, Zap, Volume2, RotateCw, Calendar
} from 'lucide-react';

// Web Audio API chime synthesizer for real-time notifications
const playSuccessChime = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.28);
    osc.start();
    osc.stop(ctx.currentTime + 0.28);
  } catch {
    // Audio Context not allowed or unsupported
  }
};

const formatTimeRemaining = (seconds) => {
  if (seconds <= 0) return 'Triggering...';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const sec = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${sec}s`;
  }
  return `${minutes.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
};

// Reusable Modal Component for Deletion
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, jobTitle, companyName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Delete Job
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete the job "<strong>{jobTitle}</strong>" at "<strong>{companyName}</strong>"? This action cannot be undone.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm cursor-pointer"
            onClick={onConfirm}
          >
            Delete
          </button>
          <button
            type="button"
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm cursor-pointer"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const ManageJobs = () => {
  const navigate = useNavigate();
  // Main State
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering and Search
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    jobType: '',
    experience: '',
    status: ''
  });
  const [sourceFilter, setSourceFilter] = useState(''); // '' | 'automated' | 'manual' | '[platform]'

  // Dropdown States
  const [isAutomatedDropdownOpen, setIsAutomatedDropdownOpen] = useState(false);
  const [isManualDropdownOpen, setIsManualDropdownOpen] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [scrapingPlatform, setScrapingPlatform] = useState('');
  
  const automatedDropdownRef = useRef(null);
  const manualDropdownRef = useRef(null);
  const lastTriggerStamp = useRef('');

  // Auto-Schedule & Daily Trigger State
  const [autoSchedule, setAutoSchedule] = useState(() => {
    try {
      const saved = localStorage.getItem('internkatta_auto_schedule');
      return saved ? JSON.parse(saved) : {
        enabled: true,
        mode: 'daily', // 'daily' (everyday at specific time) or 'interval'
        dailyTime: '09:00', // Everyday at 09:00 AM
        intervalMinutes: 60,
        platform: 'all',
        fresherOnly: true,
        deDuplicate: true,
        soundAlert: true
      };
    } catch {
      return {
        enabled: true,
        mode: 'daily',
        dailyTime: '09:00',
        intervalMinutes: 60,
        platform: 'all',
        fresherOnly: true,
        deDuplicate: true,
        soundAlert: true
      };
    }
  });

  const [countdownSeconds, setCountdownSeconds] = useState(3600);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isScrapeHistoryOpen, setIsScrapeHistoryOpen] = useState(false);
  const [scrapeHistory, setScrapeHistory] = useState(() => scrapeHistoryService.getHistory());

  // Subscribe to persistent scrape history updates
  useEffect(() => {
    setScrapeHistory(scrapeHistoryService.getHistory());
    const unsubscribe = scrapeHistoryService.subscribe((updated) => {
      setScrapeHistory(updated);
    });
    return () => unsubscribe();
  }, []);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modals state
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState('Direct');

  // Initialize with initialJobs
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        setTimeout(() => {
          setJobs(initialJobs);
          setLoading(false);
        }, 400);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        toast.error("Failed to load jobs");
        setLoading(false);
      }
    };
    
    fetchJobs();
  }, []);

  // Save autoSchedule in localStorage
  useEffect(() => {
    try {
      localStorage.setItem('internkatta_auto_schedule', JSON.stringify(autoSchedule));
    } catch {}
  }, [autoSchedule]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (automatedDropdownRef.current && !automatedDropdownRef.current.contains(event.target)) {
        setIsAutomatedDropdownOpen(false);
      }
      if (manualDropdownRef.current && !manualDropdownRef.current.contains(event.target)) {
        setIsManualDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Platforms Definition for Scraping
  const scrapePlatforms = [
    {
      key: 'all',
      label: 'All Platforms',
      subtitle: 'LinkedIn, Naukri, Glassdoor, Internshala & Indeed',
      icon: Globe,
      color: 'text-purple-600 bg-purple-50 hover:bg-purple-100 border-purple-200'
    },
    {
      key: 'indeed',
      label: 'Indeed',
      subtitle: 'Entry-Level & Freshers (0-1 Years) Openings',
      icon: Target,
      color: 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border-indigo-200'
    },
    {
      key: 'linkedin',
      label: 'LinkedIn',
      subtitle: 'Tech, Product & Global Corporate Roles',
      icon: Linkedin,
      color: 'text-sky-600 bg-sky-50 hover:bg-sky-100 border-sky-200'
    },
    {
      key: 'naukri',
      label: 'Naukri.com',
      subtitle: 'Indian MNC & Enterprise IT Opportunities',
      icon: Briefcase,
      color: 'text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-200'
    },
    {
      key: 'glassdoor',
      label: 'Glassdoor',
      subtitle: 'High-Paying Verified Company Openings',
      icon: Building2,
      color: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
    },
    {
      key: 'internshala',
      label: 'Internshala',
      subtitle: 'Freshers & Student Internship Programs',
      icon: GraduationCap,
      color: 'text-cyan-600 bg-cyan-50 hover:bg-cyan-100 border-cyan-200'
    }
  ];

  // Helper to calculate the next trigger time and remaining seconds
  const getNextTriggerInfo = useCallback(() => {
    if (!autoSchedule || !autoSchedule.enabled) {
      return { text: 'Paused', clock: '', dayLabel: '', secondsRemaining: 0 };
    }
    const now = new Date();
    
    if (autoSchedule.mode === 'daily') {
      const timeParts = (autoSchedule.dailyTime || '09:00').split(':');
      const targetH = parseInt(timeParts[0] || '9', 10);
      const targetM = parseInt(timeParts[1] || '0', 10);
      
      const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), targetH, targetM, 0);
      let isTomorrow = false;
      if (target.getTime() <= now.getTime()) {
        target.setDate(target.getDate() + 1);
        isTomorrow = true;
      }
      
      const diffSec = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000));
      const ampm = targetH >= 12 ? 'PM' : 'AM';
      const h12 = targetH % 12 || 12;
      const mStr = targetM.toString().padStart(2, '0');
      const formattedClock = `${h12}:${mStr} ${ampm}`;
      const dayLabel = isTomorrow ? 'Tomorrow' : 'Today';

      return {
        text: `${dayLabel} at ${formattedClock}`,
        clock: formattedClock,
        dayLabel,
        secondsRemaining: diffSec,
        targetDate: target
      };
    } else {
      const totalSec = (autoSchedule.intervalMinutes || 60) * 60;
      return {
        text: `Every ${autoSchedule.intervalMinutes}m`,
        clock: `${autoSchedule.intervalMinutes}m`,
        dayLabel: '',
        secondsRemaining: totalSec,
        targetDate: new Date(now.getTime() + totalSec * 1000)
      };
    }
  }, [autoSchedule]);

  // Scraper Execution Handler with Smart De-Duplication & Fresher Priority
  const handleScrape = useCallback(async (platformKey, platformLabel, isScheduled = false) => {
    setIsScraping(true);
    setScrapingPlatform(platformLabel);
    setIsManualDropdownOpen(false);

    try {
      let rawFetchedJobs = [];

      // 1. Attempt Backend Scraper API
      try {
        const res = await api.get(`/api/jobs/scrape?platform=${platformKey}`);
        if (res.data && res.data.jobs && res.data.jobs.length > 0) {
          rawFetchedJobs = res.data.jobs;
        } else {
          throw new Error('Empty backend scrape response');
        }
      } catch (err) {
        // 2. Client-side Fallback Scraper
        rawFetchedJobs = scrapeJobsClient(platformKey);
      }

      // Smart Rule 1: Fresher Radar Mode (0-1 Years Priority)
      let candidates = rawFetchedJobs;
      if (autoSchedule.fresherOnly) {
        candidates = candidates.filter(j => {
          const exp = (j.experience || '').toLowerCase();
          const jt = (j.jobType || '').toLowerCase();
          return exp.includes('fresher') || exp.includes('0-1') || exp.includes('0-2') || jt === 'internship';
        });
        if (candidates.length === 0) {
          candidates = rawFetchedJobs;
        }
      }

      // Smart Rule 2: Smart De-Duplication Engine
      setJobs(prev => {
        const existingKeys = new Set(prev.map(j => `${j.companyName.toLowerCase().trim()}:::${j.jobTitle.toLowerCase().trim()}`));
        const existingIds = new Set(prev.map(j => j._id));

        let newJobs = [];
        let skippedCount = 0;

        if (autoSchedule.deDuplicate) {
          for (const cand of candidates) {
            const key = `${cand.companyName.toLowerCase().trim()}:::${cand.jobTitle.toLowerCase().trim()}`;
            if (!existingKeys.has(key) && !existingIds.has(cand._id)) {
              newJobs.push(cand);
              existingKeys.add(key);
            } else {
              skippedCount++;
            }
          }
        } else {
          newJobs = candidates.filter(j => !existingIds.has(j._id));
        }

        const addedCount = newJobs.length;

        // Smart Rule 3: Audio Alert
        if (autoSchedule.soundAlert && addedCount > 0) {
          playSuccessChime();
        }

        // Record into Activity Log and Persistent Storage
        scrapeHistoryService.addLog({
          platform: platformKey,
          platformLabel,
          isScheduled,
          addedCount,
          skippedCount,
          duration: '2.0s',
          status: 'Completed',
          jobsSummary: newJobs.slice(0, 5).map(j => ({
            title: j.jobTitle,
            company: j.companyName,
            location: j.location,
            experience: j.experience,
            salary: j.salary,
            skills: j.skills || []
          }))
        });

        if (isScheduled) {
          toast.success(`⏰ Daily Trigger: Auto-scraped ${addedCount} jobs from ${platformLabel}! (${skippedCount} duplicates skipped)`);
        } else {
          toast.success(`✨ Manually scraped ${addedCount} live jobs from ${platformLabel}! (${skippedCount} duplicates skipped)`);
        }

        return [...newJobs, ...prev];
      });

    } catch (err) {
      console.error("Scraping execution error:", err);
      toast.error(`Failed to scrape jobs from ${platformLabel}`);
    } finally {
      setIsScraping(false);
      setScrapingPlatform('');
      setCurrentPage(1);
    }
  }, [autoSchedule.fresherOnly, autoSchedule.deDuplicate, autoSchedule.soundAlert]);

  // Everyday Auto-Trigger Countdown Timer Effect
  useEffect(() => {
    let timer = null;
    if (autoSchedule.enabled) {
      timer = setInterval(() => {
        const info = getNextTriggerInfo();
        setCountdownSeconds(info.secondsRemaining);

        // When exact scheduled trigger time arrives (within 1 second)
        if (info.secondsRemaining <= 1) {
          const nowMinuteStamp = new Date().toISOString().slice(0, 16);
          if (lastTriggerStamp.current !== nowMinuteStamp) {
            lastTriggerStamp.current = nowMinuteStamp;
            const targetKey = autoSchedule.platform || 'all';
            const foundPlat = scrapePlatforms.find(p => p.key === targetKey);
            const label = foundPlat ? foundPlat.label : 'All Platforms';
            handleScrape(targetKey, label, true);
          }
        }
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [autoSchedule, getNextTriggerInfo, handleScrape]);

  // Handlers for Schedule
  const handleToggleSchedule = () => {
    setAutoSchedule(prev => ({
      ...prev,
      enabled: !prev.enabled
    }));
    toast.success(autoSchedule.enabled ? 'Automated daily trigger paused' : 'Automated daily trigger activated');
  };

  const handleSetDailyTime = (timeStr) => {
    setAutoSchedule(prev => ({
      ...prev,
      mode: 'daily',
      dailyTime: timeStr,
      enabled: true
    }));
    toast.success(`Automated trigger scheduled everyday at ${timeStr}`);
  };

  const handleRunNow = () => {
    const targetKey = autoSchedule.platform || 'all';
    const foundPlat = scrapePlatforms.find(p => p.key === targetKey);
    const label = foundPlat ? foundPlat.label : 'All Platforms';
    handleScrape(targetKey, label, false);
  };

  const handleSaveSchedule = (newConfig) => {
    setAutoSchedule(newConfig);
    toast.success('Schedule settings updated successfully');
  };

  // Filter and Search Logic
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      // Search
      const searchMatch = 
        job.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.skills && job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())));

      // Filters
      const locationMatch = !filters.location || job.location.includes(filters.location);
      const jobTypeMatch = !filters.jobType || job.jobType === filters.jobType;
      
      // Experience Match
      let expMatch = true;
      if (filters.experience) {
        const filterExp = filters.experience.toLowerCase();
        const jobExp = (job.experience || '').toLowerCase();
        if (filterExp === '0-1 years' || filterExp === 'fresher') {
          expMatch = jobExp === '0-1 years' || jobExp === 'fresher' || jobExp.includes('0-1') || jobExp.includes('fresher');
        } else if (filterExp === '0-2 years') {
          expMatch = jobExp === '0-2 years' || jobExp === '0-1 years' || jobExp === 'fresher';
        } else {
          expMatch = jobExp === filterExp;
        }
      }

      const statusMatch = !filters.status || job.status === filters.status;

      // Source Match (Automated vs Manual vs Specific Platform)
      let sourceMatch = true;
      const automatedSources = ['scraped', 'api imported', 'automated', 'linkedin', 'naukri', 'glassdoor', 'internshala', 'indeed'];
      
      if (sourceFilter === 'automated') {
        const s = (job.source || '').toLowerCase();
        sourceMatch = automatedSources.includes(s);
      } else if (sourceFilter === 'manual') {
        sourceMatch = (job.source || '').toLowerCase() === 'manual';
      } else if (sourceFilter) {
        const s = (job.source || '').toLowerCase();
        const p = (job.platform || '').toLowerCase();
        sourceMatch = s === sourceFilter.toLowerCase() || p === sourceFilter.toLowerCase();
      }

      return searchMatch && locationMatch && jobTypeMatch && expMatch && statusMatch && sourceMatch;
    });
  }, [jobs, searchTerm, filters, sourceFilter]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters, sourceFilter]);

  // Derived Stats
  const stats = useMemo(() => {
    const activeJobs = jobs.filter(j => j.status === 'Active').length;
    const uniqueCompanies = new Set(jobs.map(j => j.companyName)).size;
    const uniqueLocations = new Set(jobs.map(j => j.location.split(',')[0].trim())).size;
    
    return {
      total: jobs.length,
      active: activeJobs,
      companies: uniqueCompanies,
      locations: uniqueLocations
    };
  }, [jobs]);

  // Source Counts for Automated and Manual buttons
  const sourceCounts = useMemo(() => {
    const automatedSources = ['scraped', 'api imported', 'automated', 'linkedin', 'naukri', 'glassdoor', 'internshala', 'indeed'];
    const automated = jobs.filter(j => automatedSources.includes((j.source || '').toLowerCase())).length;
    const manual = jobs.filter(j => (j.source || '').toLowerCase() === 'manual').length;
    return { automated, manual };
  }, [jobs]);

  // Filter options
  const uniqueLocations = [...new Set(jobs.map(j => j.location.split(',')[0].trim()))].sort();
  const uniqueJobTypes = [...new Set(jobs.map(j => j.jobType))].sort();
  const expOrder = ['Fresher', '0-1 Years', '0-2 Years', '1-3 Years', '2-5 Years', '3-5 Years', '5+ Years'];
  const uniqueExperiences = [...new Set(jobs.map(j => j.experience))].sort((a, b) => {
    const ia = expOrder.indexOf(a);
    const ib = expOrder.indexOf(b);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.localeCompare(b);
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleToggleStatus = (job) => {
    const newStatus = job.status === 'Active' ? 'Inactive' : 'Active';
    setJobs(jobs.map(j => j._id === job._id ? { ...j, status: newStatus } : j));
    toast.success(`Job marked as ${newStatus}`);
  };

  const handleDeleteConfirm = () => {
    setJobs(jobs.filter(j => j._id !== selectedJob._id));
    toast.success('Job deleted successfully');
    setIsDeleteModalOpen(false);
    setSelectedJob(null);
  };

  const handleSaveJob = (jobData) => {
    if (selectedJob) {
      setJobs(jobs.map(j => j._id === selectedJob._id ? { ...jobData, _id: selectedJob._id } : j));
      toast.success('Job updated successfully');
    } else {
      const newJob = {
        ...jobData,
        _id: `job_manual_${Date.now()}`,
        postedDate: new Date().toISOString().split('T')[0],
        source: 'Manual'
      };
      setJobs([newJob, ...jobs]);
      toast.success('New manual job added successfully');
    }
    setIsFormModalOpen(false);
  };

  const openDeleteModal = (job) => {
    setSelectedJob(job);
    setIsDeleteModalOpen(true);
  };

  const openDetailsModal = (job) => {
    setSelectedJob(job);
    setIsDetailsModalOpen(true);
  };

  const openEditModal = (job) => {
    setSelectedJob(job);
    setSelectedPlatform(job.platform || 'Direct');
    setIsFormModalOpen(true);
  };

  const openCreateModal = (platform = 'Direct') => {
    setSelectedJob(null);
    setSelectedPlatform(platform);
    setIsFormModalOpen(true);
  };

  const triggerInfo = getNextTriggerInfo();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Jobs Management</h1>
          <p className="text-gray-500 mt-1">Manage, auto-scrape on schedule, and review opportunities from top job portals.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-medium transition-colors shadow-2xs cursor-pointer"
            title="Configure Everyday Trigger Schedule"
          >
            <Clock size={16} className="text-indigo-600" />
            <span>Auto-Timer Schedule</span>
            {autoSchedule.enabled && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            )}
          </button>
          
          <button
            onClick={() => navigate('/admin/scraping-history')}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-medium transition-colors shadow-2xs cursor-pointer"
            title="View Scrape Activity History Page"
          >
            <History size={16} className="text-purple-600" />
            <span className="hidden sm:inline">Scraping History</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-semibold">
              {scrapeHistory.length}
            </span>
          </button>

          <button 
            onClick={() => openCreateModal('Direct')}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Plus size={18} />
            <span>Add Job</span>
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-5 flex flex-col">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Jobs</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</h3>
            </div>
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
              <Briefcase size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-5 flex flex-col">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">Active Jobs</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.active}</h3>
            </div>
            <div className="bg-green-100 p-2 rounded-lg text-green-600">
              <CheckCircle size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-5 flex flex-col">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">Companies</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.companies}</h3>
            </div>
            <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
              <Building2 size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-5 flex flex-col">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">Locations</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.locations}</h3>
            </div>
            <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
              <MapPin size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* LIVE AUTOMATIC TRIGGER ENGINE BANNER (Active when timer is ON) */}
      {autoSchedule.enabled && (
        <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 border border-indigo-200/90 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <div className="w-3.5 h-3.5 bg-emerald-500 rounded-full animate-ping absolute"></div>
              <div className="w-3.5 h-3.5 bg-emerald-500 rounded-full"></div>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap size={14} className="text-indigo-600 fill-indigo-600" />
                  Automated Daily Trigger Active
                </span>
                <span className="text-[11px] bg-white text-indigo-700 px-2.5 py-0.5 rounded-full font-semibold border border-indigo-200 shadow-2xs">
                  {autoSchedule.mode === 'daily' ? `Everyday at ${autoSchedule.dailyTime}` : `Every ${autoSchedule.intervalMinutes}m`}
                </span>
                {autoSchedule.fresherOnly && (
                  <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                    🎯 0-1 Years Priority
                  </span>
                )}
                {autoSchedule.deDuplicate && (
                  <span className="text-[11px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-semibold">
                    🛡️ De-Dupe ON
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Target: <strong>{autoSchedule.platform === 'all' ? 'All Platforms' : autoSchedule.platform.toUpperCase()}</strong>. Automatically triggers on schedule every day without human intervention.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto flex-wrap">
            <div className="bg-white px-3 py-1.5 rounded-xl border border-indigo-200 text-xs font-mono font-bold text-indigo-700 flex items-center gap-1.5 shadow-2xs">
              <Clock size={13} className="text-indigo-500" />
              Next run: {triggerInfo.text} ({formatTimeRemaining(countdownSeconds)})
            </div>
            
            <button
              onClick={handleRunNow}
              disabled={isScraping}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
              title="Trigger immediately right now"
            >
              <RotateCw size={13} className={isScraping ? 'animate-spin' : ''} />
              <span>Trigger Now</span>
            </button>

            <button
              onClick={handleToggleSchedule}
              className="px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
            >
              <Pause size={13} />
              <span>Pause</span>
            </button>

            <button
              onClick={() => setIsScheduleModalOpen(true)}
              className="p-1.5 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 rounded-xl transition-colors cursor-pointer shadow-2xs"
              title="Configure Schedule Settings"
            >
              <Settings size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Section */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-5 mb-8">
        {/* Search bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by Job Title, Company, Location, or Skills..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <select 
            name="location" 
            value={filters.location} 
            onChange={handleFilterChange}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-gray-700 bg-gray-50"
          >
            <option value="">All Locations</option>
            {uniqueLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
          </select>
          
          <select 
            name="jobType" 
            value={filters.jobType} 
            onChange={handleFilterChange}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-gray-700 bg-gray-50"
          >
            <option value="">All Job Types</option>
            {uniqueJobTypes.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
          
          <select 
            name="experience" 
            value={filters.experience} 
            onChange={handleFilterChange}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-gray-700 bg-gray-50"
          >
            <option value="">All Experience</option>
            {uniqueExperiences.map(exp => <option key={exp} value={exp}>{exp}</option>)}
          </select>
          
          <select 
            name="status" 
            value={filters.status} 
            onChange={handleFilterChange}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-gray-700 bg-gray-50"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {/* BUTTONS ROW: AUTOMATED (SCHEDULED TRIGGER) & MANUAL (ON-DEMAND SCRAPE LIST) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-3 border-t border-gray-100">
          
          {/* 1. AUTOMATED BUTTON -> OPENS AUTOMATIC TRIGGER SCHEDULE SETTINGS */}
          <div className="relative" ref={automatedDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setIsAutomatedDropdownOpen(prev => !prev);
                setIsManualDropdownOpen(false);
              }}
              className={`w-full flex items-center justify-between gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all cursor-pointer ${
                autoSchedule.enabled || sourceFilter === 'automated'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:text-indigo-600'
              }`}
              title="Configure everyday automatic trigger time and scheduled scraping"
            >
              <div className="flex items-center gap-2 truncate">
                <Bot size={16} className="shrink-0" />
                <span className="font-semibold truncate">Automated</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold shrink-0 ${
                  autoSchedule.enabled || sourceFilter === 'automated'
                    ? 'bg-indigo-700 text-white' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {autoSchedule.enabled ? 'Live' : sourceCounts.automated}
                </span>
              </div>
              <ChevronDown 
                size={16} 
                className={`transition-transform duration-200 shrink-0 ${isAutomatedDropdownOpen ? 'rotate-180' : ''} ${
                  autoSchedule.enabled || sourceFilter === 'automated'
                    ? 'text-white' 
                    : 'text-gray-400'
                }`} 
              />
            </button>

            {/* Dropdown Panel for Automated Trigger Scheduler */}
            {isAutomatedDropdownOpen && (
              <div className="absolute left-0 mt-2 w-96 max-w-[94vw] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 p-3 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-gray-100 mb-2 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Zap size={14} className="text-indigo-600 fill-indigo-600" />
                      Automated Trigger Scheduler
                    </p>
                    <p className="text-[11px] text-gray-500">Everyday automatic scraping on time</p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    autoSchedule.enabled 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {autoSchedule.enabled ? '● Active' : '○ Paused'}
                  </span>
                </div>

                {/* Status & Next Trigger Box */}
                <div className="p-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 mb-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                      <Calendar size={13} className="text-indigo-600" /> Next Trigger:
                    </span>
                    <span className="text-xs font-bold text-indigo-900">
                      {triggerInfo.text}
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-indigo-100 text-xs">
                    <span className="text-gray-500 flex items-center gap-1">
                      <Clock size={12} className="text-indigo-500" /> Time Remaining:
                    </span>
                    <span className="font-mono font-bold text-indigo-700">
                      {formatTimeRemaining(countdownSeconds)}
                    </span>
                  </div>
                </div>

                {/* Everyday Trigger Time Setter */}
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 mb-3 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-800">
                    <span className="flex items-center gap-1">
                      <Clock size={13} className="text-indigo-600" /> Everyday Trigger Time:
                    </span>
                    <span className="text-[11px] text-indigo-600 font-normal">Runs daily at this time</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={autoSchedule.dailyTime || '09:00'}
                      onChange={(e) => handleSetDailyTime(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-800 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Daily Preset Chips */}
                  <div className="grid grid-cols-4 gap-1 pt-1">
                    {[
                      { label: '9:00 AM', val: '09:00' },
                      { label: '1:00 PM', val: '13:00' },
                      { label: '6:00 PM', val: '18:00' },
                      { label: '11:00 PM', val: '23:00' }
                    ].map(p => (
                      <button
                        key={p.val}
                        type="button"
                        onClick={() => handleSetDailyTime(p.val)}
                        className={`py-1 text-[10px] rounded-md font-semibold border transition-colors cursor-pointer text-center ${
                          autoSchedule.dailyTime === p.val && autoSchedule.enabled
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Target Platforms to Auto-Scrape */}
                <div className="mb-3">
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                    Platforms to Auto-Scrape Everyday:
                  </label>
                  <select
                    value={autoSchedule.platform}
                    onChange={(e) => setAutoSchedule(prev => ({ ...prev, platform: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-800 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All Platforms (LinkedIn, Naukri, Glassdoor, Internshala, Indeed)</option>
                    <option value="indeed">Indeed (0-1 Years & Freshers)</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="naukri">Naukri.com</option>
                    <option value="glassdoor">Glassdoor</option>
                    <option value="internshala">Internshala</option>
                  </select>
                </div>

                {/* Action Buttons: Toggle & Trigger Right Now */}
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    type="button"
                    onClick={handleToggleSchedule}
                    className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      autoSchedule.enabled
                        ? 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-200'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {autoSchedule.enabled ? (
                      <><Pause size={13} /> Pause Trigger</>
                    ) : (
                      <><Play size={13} /> Turn On Trigger</>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleRunNow();
                      setIsAutomatedDropdownOpen(false);
                    }}
                    disabled={isScraping}
                    className="py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <RotateCw size={13} className={isScraping ? 'animate-spin' : ''} />
                    <span>Trigger Now ⚡</span>
                  </button>
                </div>

                {/* Dropdown Footer Links */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setSourceFilter(prev => prev === 'automated' ? '' : 'automated');
                      setIsAutomatedDropdownOpen(false);
                    }}
                    className="text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
                  >
                    {sourceFilter === 'automated' ? '✕ Clear filter' : `View Automated (${sourceCounts.automated})`}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsScheduleModalOpen(true);
                      setIsAutomatedDropdownOpen(false);
                    }}
                    className="text-gray-500 hover:text-indigo-600 text-[11px] flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <Settings size={12} /> Schedule Settings
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 2. MANUAL BUTTON -> OPENS ON-DEMAND PLATFORM SCRAPE LIST */}
          <div className="relative" ref={manualDropdownRef}>
            <button
              type="button"
              disabled={isScraping}
              onClick={() => {
                setIsManualDropdownOpen(prev => !prev);
                setIsAutomatedDropdownOpen(false);
              }}
              className={`w-full flex items-center justify-between gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all cursor-pointer ${
                isScraping
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-300 animate-pulse'
                  : sourceFilter === 'manual'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:text-indigo-600'
              }`}
              title="Pick any platform to manually scrape live jobs right now or add direct entries"
            >
              <div className="flex items-center gap-2 truncate">
                <User size={16} className="shrink-0" />
                <span className="font-semibold truncate">
                  {isScraping ? `Scraping ${scrapingPlatform}...` : 'Manual'}
                </span>
                {!isScraping && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold shrink-0 ${
                    sourceFilter === 'manual'
                      ? 'bg-indigo-700 text-white' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {sourceCounts.manual}
                  </span>
                )}
              </div>
              <ChevronDown 
                size={16} 
                className={`transition-transform duration-200 shrink-0 ${isManualDropdownOpen ? 'rotate-180' : ''} ${
                  sourceFilter === 'manual' ? 'text-white' : 'text-gray-400'
                }`} 
              />
            </button>

            {/* Dropdown List for Manual Scraping & Direct Entries */}
            {isManualDropdownOpen && (
              <div className="absolute left-0 mt-2 w-92 max-w-[92vw] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 p-2.5 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-gray-100 mb-1 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles size={13} className="text-indigo-600" />
                      Manual On-Demand Scrape
                    </p>
                    <p className="text-[11px] text-gray-500">Pick any platform to fetch live data right now:</p>
                  </div>
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-full">
                    Live
                  </span>
                </div>

                {/* Platforms List to Scrape Manually */}
                <div className="space-y-1">
                  {scrapePlatforms.map((plat) => {
                    const Icon = plat.icon;
                    return (
                      <button
                        key={plat.key}
                        type="button"
                        onClick={() => handleScrape(plat.key, plat.label, false)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-indigo-50/60 transition-colors group cursor-pointer border border-transparent hover:border-indigo-100"
                      >
                        <div className={`p-2 rounded-lg border ${plat.color} transition-transform group-hover:scale-105 shrink-0`}>
                          <Icon size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-gray-800 group-hover:text-indigo-600 text-sm truncate">
                              {plat.label}
                            </p>
                            <span className="text-[10px] text-indigo-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                              Scrape →
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 truncate">{plat.subtitle}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Direct Custom Job Posting Link */}
                <div className="mt-2.5 p-2.5 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-800">Direct Manual Entry?</p>
                    <p className="text-[11px] text-gray-500">Add a custom job from scratch</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      openCreateModal('Direct');
                      setIsManualDropdownOpen(false);
                    }}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                  >
                    <Plus size={13} /> Add Job
                  </button>
                </div>

                {/* Dropdown Footer */}
                <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between px-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setSourceFilter(prev => prev === 'manual' ? '' : 'manual');
                      setIsManualDropdownOpen(false);
                    }}
                    className="text-indigo-600 hover:text-indigo-800 font-medium py-1 cursor-pointer"
                  >
                    {sourceFilter === 'manual' ? '✕ Clear filter' : `View Manual Jobs (${sourceCounts.manual})`}
                  </button>
                  <span className="text-[10px] text-gray-400">On-Demand Web Parser</span>
                </div>
              </div>
            )}
          </div>

          {/* 3. HISTORY BUTTON -> DIRECTLY BELOW ALL EXPERIENCE (COLUMN 3) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => navigate('/admin/scraping-history')}
              className="w-full flex items-center justify-between gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-purple-50 hover:border-purple-400 hover:text-purple-700 transition-all cursor-pointer shadow-xs group"
              title="Open all scraping history page with logs, analytics, and records"
            >
              <div className="flex items-center gap-2 truncate">
                <History size={16} className="text-purple-600 shrink-0 group-hover:rotate-[-20deg] transition-transform" />
                <span className="font-semibold truncate">History</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold shrink-0 bg-purple-100 text-purple-700 group-hover:bg-purple-200">
                  {scrapeHistory.length}
                </span>
              </div>
              <div className="flex items-center gap-0.5 text-xs text-purple-600 font-semibold group-hover:translate-x-0.5 transition-transform shrink-0">
                <span>Page</span>
                <ChevronRight size={14} />
              </div>
            </button>
          </div>

          {/* Reset Active Source Filter Button */}
          {sourceFilter && (
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setSourceFilter('')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium underline underline-offset-2 transition-colors cursor-pointer flex items-center gap-1"
              >
                ✕ Reset filter: Showing all {jobs.length} jobs
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Live Scraping Feedback Banner */}
      {isScraping && (
        <div className="mb-6 p-4 rounded-xl border border-indigo-200 bg-indigo-50/80 flex items-center justify-between shadow-xs animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-600 text-white">
              <Loader2 size={18} className="animate-spin" />
            </div>
            <div>
              <p className="font-semibold text-indigo-950 text-sm">
                Scraping recent jobs automatically from {scrapingPlatform}...
              </p>
              <p className="text-xs text-indigo-700">
                Fetching open roles, requirements, salary, and company details in real time.
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-white text-indigo-700 rounded-full border border-indigo-200 shadow-xs hidden sm:inline-block">
            Scraper Active
          </span>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-700">Company & Job Title</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Location</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Type / Exp</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Source</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
                <th className="px-6 py-4 font-semibold text-gray-700 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                      <span className="ml-2 text-gray-500">Loading jobs...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedJobs.length > 0 ? (
                paginatedJobs.map((job) => (
                  <tr key={job._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{job.jobTitle}</div>
                      <div className="text-gray-500 flex items-center mt-1">
                        <Building2 size={14} className="mr-1" />
                        {job.companyName}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-700 flex items-center">
                        <MapPin size={14} className="mr-1 text-gray-400" />
                        {job.location.split(',')[0]}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs w-fit border border-blue-100">
                          {job.jobType}
                        </span>
                        <span className="text-gray-500 text-xs font-medium">{job.experience}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {/* Platform / Source Tag */}
                      {(() => {
                        const src = (job.source || '').toLowerCase();
                        const plat = (job.platform || '').toLowerCase();
                        if (src === 'linkedin' || plat === 'linkedin') {
                          return (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                              <Linkedin size={12} />
                              LinkedIn
                            </span>
                          );
                        } else if (src === 'naukri' || plat === 'naukri') {
                          return (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                              <Briefcase size={12} />
                              Naukri
                            </span>
                          );
                        } else if (src === 'glassdoor' || plat === 'glassdoor') {
                          return (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <Building2 size={12} />
                              Glassdoor
                            </span>
                          );
                        } else if (src === 'internshala' || plat === 'internshala') {
                          return (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">
                              <GraduationCap size={12} />
                              Internshala
                            </span>
                          );
                        } else if (src === 'indeed' || plat === 'indeed') {
                          return (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                              <Target size={12} />
                              Indeed
                            </span>
                          );
                        } else if (src === 'manual') {
                          return (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                              <User size={12} />
                              {job.platform && job.platform !== 'Direct' ? `Manual (${job.platform})` : 'Manual'}
                            </span>
                          );
                        } else {
                          return (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                              <Bot size={12} />
                              {job.source || 'Scraped'}
                            </span>
                          );
                        }
                      })()}
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleToggleStatus(job)}
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                          job.status === 'Active' 
                            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
                            : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                        }`}
                        title="Click to toggle status"
                      >
                        {job.status === 'Active' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        {job.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button 
                          onClick={() => openDetailsModal(job)}
                          className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 p-1.5 rounded-md transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => openEditModal(job)}
                          className="text-blue-600 hover:text-blue-900 bg-blue-50 p-1.5 rounded-md transition-colors cursor-pointer"
                          title="Edit Job"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => openDeleteModal(job)}
                          className="text-red-600 hover:text-red-900 bg-red-50 p-1.5 rounded-md transition-colors cursor-pointer"
                          title="Delete Job"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <Briefcase size={40} className="text-gray-300 mb-3" />
                      <p className="text-lg font-medium text-gray-600">No jobs found</p>
                      <p className="text-sm">Try adjusting your search or filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {!loading && filteredJobs.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredJobs.length)}</span> of <span className="font-medium">{filteredJobs.length}</span> results
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm font-medium text-gray-700 px-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <JobDetailsModal 
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        job={selectedJob}
      />

      <JobFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        job={selectedJob}
        onSave={handleSaveJob}
        initialPlatform={selectedPlatform}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        jobTitle={selectedJob?.jobTitle}
        companyName={selectedJob?.companyName}
      />

      <AutoScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        scheduleConfig={autoSchedule}
        onSaveSchedule={handleSaveSchedule}
      />

      <AutoScrapeHistoryModal
        isOpen={isScrapeHistoryOpen}
        onClose={() => setIsScrapeHistoryOpen(false)}
        history={scrapeHistory}
        onClearHistory={() => scrapeHistoryService.clearHistory()}
      />

    </div>
  );
};

export default ManageJobs;
