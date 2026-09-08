import api from './api';

// Utility to track clicks (internships, nav links, etc.)

function getSessionId() {
  try {
    let sid = localStorage.getItem('sessionId');
    if (!sid) {
      sid = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
      localStorage.setItem('sessionId', sid);
    }
    return sid;
  } catch (e) {
    return Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
  }
}

/**
 * Track an internship click
 * @param {Object} internshipData - { internshipId, internshipTitle, internshipPrice, page }
 */
export async function trackInternshipClick(internshipData) {
  const sessionId = getSessionId();
  try {
    await api.patch('/api/visits/clicks', {
        sessionId,
        clickType: 'internship',
        clickData: {
          internshipId: internshipData.internshipId,
          internshipTitle: internshipData.internshipTitle || internshipData.title,
          internshipPrice: internshipData.internshipPrice || internshipData.price,
          page: internshipData.page || window.location.pathname,
        },
    });
  } catch (err) {
    // silently ignore
    console.error('trackInternshipClick failed:', err);
  }
}

/**
 * Track a nav link click
 * @param {Object} navData - { linkName, linkPath, page }
 */
export async function trackNavLinkClick(navData) {
  const sessionId = getSessionId();
  try {
    await api.patch('/api/visits/clicks', {
        sessionId,
        clickType: 'navLink',
        clickData: {
          linkName: navData.linkName,
          linkPath: navData.linkPath || navData.path,
          page: navData.page || window.location.pathname,
        },
    });
  } catch (err) {
    // silently ignore
    console.error('trackNavLinkClick failed:', err);
  }
}




