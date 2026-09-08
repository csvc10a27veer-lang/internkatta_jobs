import api from './api';

// lightweight session id generator (random alphanumeric)
function generateId() {
  return Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
}

function getSessionId() {
  try {
    let sid = localStorage.getItem('sessionId');
    if (!sid) {
      sid = generateId();
      localStorage.setItem('sessionId', sid);
    }
    return sid;
  } catch (e) {
    return generateId();
  }
}

export default async function trackVisit(page) {
  const sessionId = getSessionId();
  try {
    await api.post('/api/visits', {
        page,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        sessionId,
    });
  } catch (err) {
    // silently ignore
    console.error('trackVisit failed:', err);
  }
}
