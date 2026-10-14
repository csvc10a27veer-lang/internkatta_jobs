// src/admin/jobs/scrapeHistoryService.js

const STORAGE_KEY = 'internkatta_scrape_history';
const EVENT_KEY = 'internkatta_history_change';

// High-quality initial seed data so the history page is immediately populated and informative
const INITIAL_SEED_HISTORY = [
  {
    id: 'scrape_seed_001',
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    date: new Date(Date.now() - 25 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    time: new Date(Date.now() - 25 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    platform: 'indeed',
    platformLabel: 'Indeed',
    triggerType: 'manual',
    isScheduled: false,
    addedCount: 4,
    skippedCount: 1,
    status: 'Completed',
    duration: '1.8s',
    jobsSummary: [
      {
        title: 'Junior Data Analyst (0-1 Years)',
        company: 'Deloitte',
        location: 'Hyderabad, Telangana',
        experience: '0-1 Years',
        salary: '₹6-9 LPA',
        skills: ['Python', 'SQL', 'PowerBI']
      },
      {
        title: 'Junior QA & Automation Tester',
        company: 'Cognizant',
        location: 'Bangalore, Karnataka',
        experience: '0-1 Years',
        salary: '₹4.0-5.5 LPA',
        skills: ['Manual Testing', 'Selenium', 'Java']
      },
      {
        title: 'Associate Frontend Developer',
        company: 'Wipro',
        location: 'Pune, Maharashtra',
        experience: '0-1 Years',
        salary: '₹4.5-6.5 LPA',
        skills: ['React', 'JavaScript', 'CSS']
      },
      {
        title: 'Junior Python Backend Trainee',
        company: 'Capgemini',
        location: 'Mumbai, Maharashtra',
        experience: 'Fresher',
        salary: '₹4.2-6 LPA',
        skills: ['Python', 'Django', 'SQL']
      }
    ]
  },
  {
    id: 'scrape_seed_002',
    timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    date: new Date(Date.now() - 3 * 3600 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    time: new Date(Date.now() - 3 * 3600 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    platform: 'all',
    platformLabel: 'All Platforms',
    triggerType: 'scheduled',
    isScheduled: true,
    addedCount: 8,
    skippedCount: 3,
    status: 'Completed',
    duration: '3.4s',
    jobsSummary: [
      {
        title: 'Software Engineer - Campus Graduate',
        company: 'Microsoft',
        location: 'Hyderabad, Telangana',
        experience: 'Fresher',
        salary: '₹14-18 LPA',
        skills: ['C++', 'Algorithms', 'Data Structures']
      },
      {
        title: 'Graduate Engineer Trainee',
        company: 'L&T Technology Services',
        location: 'Vadodara, Gujarat',
        experience: 'Fresher',
        salary: '₹4-5.5 LPA',
        skills: ['Embedded C', 'IoT', 'Python']
      },
      {
        title: 'Cloud Associate Engineer (0-1 Years)',
        company: 'Amazon Web Services',
        location: 'Bangalore, Karnataka',
        experience: '0-1 Years',
        salary: '₹12-16 LPA',
        skills: ['AWS', 'Linux', 'Networking']
      },
      {
        title: 'React Native Mobile Developer',
        company: 'Swiggy',
        location: 'Bangalore, Karnataka',
        experience: '0-2 Years',
        salary: '₹8-12 LPA',
        skills: ['React Native', 'Redux', 'TypeScript']
      }
    ]
  },
  {
    id: 'scrape_seed_003',
    timestamp: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    date: new Date(Date.now() - 18 * 3600 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    time: new Date(Date.now() - 18 * 3600 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    platform: 'linkedin',
    platformLabel: 'LinkedIn',
    triggerType: 'manual',
    isScheduled: false,
    addedCount: 5,
    skippedCount: 2,
    status: 'Completed',
    duration: '2.1s',
    jobsSummary: [
      {
        title: 'Junior DevOps Engineer',
        company: 'Oracle',
        location: 'Bangalore, Karnataka',
        experience: '0-2 Years',
        salary: '₹9-13 LPA',
        skills: ['Docker', 'Kubernetes', 'CI/CD']
      },
      {
        title: 'Frontend Engineering Intern',
        company: 'Zomato',
        location: 'Gurugram, Haryana',
        experience: 'Fresher',
        salary: '₹35,000/mo',
        skills: ['Next.js', 'TailwindCSS', 'TypeScript']
      }
    ]
  },
  {
    id: 'scrape_seed_004',
    timestamp: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
    date: new Date(Date.now() - 28 * 3600 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    time: new Date(Date.now() - 28 * 3600 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    platform: 'naukri',
    platformLabel: 'Naukri.com',
    triggerType: 'manual',
    isScheduled: false,
    addedCount: 6,
    skippedCount: 0,
    status: 'Completed',
    duration: '2.5s',
    jobsSummary: [
      {
        title: 'Full Stack Java Developer Trainee',
        company: 'HCL Technologies',
        location: 'Noida, Uttar Pradesh',
        experience: '0-1 Years',
        salary: '₹4.5-6 LPA',
        skills: ['Java', 'Spring Boot', 'MySQL']
      },
      {
        title: 'Trainee Business Analyst',
        company: 'Tech Mahindra',
        location: 'Pune, Maharashtra',
        experience: 'Fresher',
        salary: '₹3.8-5 LPA',
        skills: ['Excel', 'Agile', 'Documentation']
      }
    ]
  },
  {
    id: 'scrape_seed_005',
    timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    date: new Date(Date.now() - 48 * 3600 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    time: new Date(Date.now() - 48 * 3600 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    platform: 'internshala',
    platformLabel: 'Internshala',
    triggerType: 'scheduled',
    isScheduled: true,
    addedCount: 5,
    skippedCount: 1,
    status: 'Completed',
    duration: '1.9s',
    jobsSummary: [
      {
        title: 'Web Development Virtual Intern',
        company: 'StartUp Labs',
        location: 'Remote, India',
        experience: 'Fresher',
        salary: '₹15,000/mo',
        skills: ['HTML', 'CSS', 'JavaScript']
      }
    ]
  }
];

export const scrapeHistoryService = {
  // Get all history logs
  getHistory: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_HISTORY));
        return INITIAL_SEED_HISTORY;
      }
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_HISTORY));
        return INITIAL_SEED_HISTORY;
      }
      return parsed;
    } catch (err) {
      console.error('Error reading scrape history from localStorage:', err);
      return INITIAL_SEED_HISTORY;
    }
  },

  // Add a new scrape record
  addLog: (logData) => {
    try {
      const current = scrapeHistoryService.getHistory();
      const newEntry = {
        id: `scrape_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        platform: logData.platform || 'all',
        platformLabel: logData.platformLabel || 'All Platforms',
        triggerType: logData.isScheduled ? 'scheduled' : 'manual',
        isScheduled: Boolean(logData.isScheduled),
        addedCount: typeof logData.addedCount === 'number' ? logData.addedCount : 0,
        skippedCount: typeof logData.skippedCount === 'number' ? logData.skippedCount : 0,
        status: logData.status || 'Completed',
        duration: logData.duration || '2.1s',
        jobsSummary: Array.isArray(logData.jobsSummary) ? logData.jobsSummary : []
      };

      const updated = [newEntry, ...current].slice(0, 100); // Keep max 100 records
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event(EVENT_KEY));
      return newEntry;
    } catch (err) {
      console.error('Error saving scrape log:', err);
      return null;
    }
  },

  // Delete a specific log by ID
  deleteLog: (id) => {
    try {
      const current = scrapeHistoryService.getHistory();
      const updated = current.filter(item => item.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event(EVENT_KEY));
      return updated;
    } catch (err) {
      console.error('Error deleting scrape log:', err);
      return [];
    }
  },

  // Clear all history
  clearHistory: () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      window.dispatchEvent(new Event(EVENT_KEY));
      return [];
    } catch (err) {
      console.error('Error clearing scrape history:', err);
      return [];
    }
  },

  // Reset to initial sample data
  resetToDefault: () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_HISTORY));
      window.dispatchEvent(new Event(EVENT_KEY));
      return INITIAL_SEED_HISTORY;
    } catch (err) {
      console.error('Error resetting scrape history:', err);
      return [];
    }
  },

  // Subscribe to changes in history across tabs or components
  subscribe: (callback) => {
    const handler = () => {
      callback(scrapeHistoryService.getHistory());
    };
    window.addEventListener(EVENT_KEY, handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener(EVENT_KEY, handler);
      window.removeEventListener('storage', handler);
    };
  },

  // Export history as JSON file
  exportJSON: (history) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `internkatta_scrape_history_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  },

  // Export history as CSV file
  exportCSV: (history) => {
    const headers = ['ID', 'Date', 'Time', 'Platform', 'Trigger Type', 'Status', 'Jobs Added', 'Duplicates Skipped', 'Duration'];
    const rows = history.map(item => [
      `"${item.id}"`,
      `"${item.date}"`,
      `"${item.time}"`,
      `"${item.platformLabel || item.platform}"`,
      `"${item.isScheduled ? 'Auto-Timer (Scheduled)' : 'Manual On-Demand'}"`,
      `"${item.status || 'Completed'}"`,
      item.addedCount,
      item.skippedCount,
      `"${item.duration || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodedUri);
    downloadAnchor.setAttribute('download', `internkatta_scrape_history_${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }
};

export default scrapeHistoryService;
