// src/utils/appliedJobsService.js

export const APPLIED_JOBS_KEY = 'internkatta_applied_jobs';

/**
 * Retrieve the list of applied job IDs from localStorage
 * @returns {Array<string>} Array of job IDs
 */
export const getAppliedJobIds = () => {
  try {
    const raw = localStorage.getItem(APPLIED_JOBS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('[AppliedJobsService] Error reading applied jobs:', err);
    return [];
  }
};

/**
 * Check if a specific job ID has already been applied to
 * @param {string|number} jobId
 * @returns {boolean}
 */
export const isJobApplied = (jobId) => {
  if (!jobId) return false;
  const applied = getAppliedJobIds();
  const sId = String(jobId);
  return applied.some((id) => String(id) === sId);
};

/**
 * Record a new job application and dispatch an update event across the app
 * @param {string|number} jobId
 * @returns {Array<string>} Updated array of applied job IDs
 */
export const markJobAsApplied = (jobId) => {
  if (!jobId) return getAppliedJobIds();
  try {
    const applied = getAppliedJobIds();
    const sId = String(jobId);
    if (!applied.some((id) => String(id) === sId)) {
      const updated = [...applied, sId];
      localStorage.setItem(APPLIED_JOBS_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('internkatta_applied_jobs_updated', { detail: updated }));
      return updated;
    }
    return applied;
  } catch (err) {
    console.error('[AppliedJobsService] Error marking job applied:', err);
    return [];
  }
};

export default {
  APPLIED_JOBS_KEY,
  getAppliedJobIds,
  isJobApplied,
  markJobAsApplied
};
