// frontend/src/utils/googleAuth.js

import api from './api';

let googleScriptPromise = null;
let initializedGoogleConfig = null;

const loadGoogleScript = () => {
  if (googleScriptPromise) {
    return googleScriptPromise;
  }

  googleScriptPromise = new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      console.log('Google Identity Services already loaded and ready');
      resolve();
      return;
    }

    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    const script = existingScript || document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;

    script.onload = () => {
      console.log('Google Identity Services script loaded, checking readiness...');

      let attempts = 0;
      const maxAttempts = 20;

      const pollForReadiness = () => {
        attempts += 1;

        if (window.google?.accounts?.id) {
          console.log('Google Identity Services is ready');
          resolve();
        } else if (attempts >= maxAttempts) {
          console.error('Google Identity Services failed to initialize within timeout');
          reject(new Error('Google Identity Services initialization timeout'));
        } else {
          console.log(`Polling for Google Identity Services readiness... attempt ${attempts}/${maxAttempts}`);
          setTimeout(pollForReadiness, 100);
        }
      };

      setTimeout(pollForReadiness, 100);
    };

    script.onerror = (error) => {
      console.error('Failed to load Google Identity Services script:', error);
      googleScriptPromise = null;
      reject(error);
    };

    if (!existingScript) {
      document.head.appendChild(script);
    }
  });

  return googleScriptPromise;
};

const handleCredentialResponse = async (response) => {
  try {
    const result = await api.post('/api/auth/google/user', {
      token: response.credential
    });

    if (result.data.token) {
      const user = result.data.user || {};
      localStorage.setItem('userAuth', JSON.stringify({
        token: result.data.token,
        user: {
          _id: user._id || user.id,
          fullName: user.fullName,
          email: user.email,
          profilePicture: user.profilePicture,
          role: user.role || 'user',
          enrolledCourses: user.enrolledCourses || [],
          enrolledInternships: user.enrolledInternships || [],
          needsSecuritySetup: user.needsSecuritySetup || false
        }
      }));
      window.location.href = '/user/internship';
    }
  } catch (error) {
    console.error('Google authentication failed:', error);
    alert('Google authentication failed. Please try again.');
  }
};

export const handleAdminGoogleAuth = async (response) => {
  try {
    const result = await api.post('/api/auth/google/admin', {
      token: response.credential
    });

    if (result.data.token) {
      const admin = result.data.admin || {};
      localStorage.setItem('adminAuth', JSON.stringify({
        token: result.data.token,
        admin: {
          _id: admin._id || admin.id,
          fullName: admin.fullName,
          email: admin.email,
          profilePicture: admin.profilePicture,
          role: admin.role || 'admin',
        }
      }));
      window.location.href = '/admin/managecourse';
    }
  } catch (error) {
    console.error('Google admin authentication failed:', error);
    alert('Google authentication failed. Please try again.');
  }
};

let setupInFlight = null;

export const setupGoogleSignInButton = async (elementId, isAdmin = false) => {
  // Guard against double-invocation (e.g. React StrictMode mounting twice),
  // which can race the GSI script load and trigger a spurious 403.
  if (setupInFlight) {
    await setupInFlight;
    return; // <--- FIX: Ensure we return after awaiting, instead of proceeding to run a second time.
  }
  setupInFlight = _setupGoogleSignInButton(elementId, isAdmin);
  try {
    await setupInFlight;
  } finally {
    setupInFlight = null;
  }
};

const _setupGoogleSignInButton = async (elementId, isAdmin = false) => {
  try {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.error('VITE_GOOGLE_CLIENT_ID is not set in environment variables');
      throw new Error('Google Client ID not configured');
    }

    console.log('Loading Google Identity Services script...');
    await loadGoogleScript();

    const targetElement = document.getElementById(elementId);
    if (!targetElement) {
      console.warn(`Google Sign-In target element not found: ${elementId}`);
      return;
    }

    if (!window.google?.accounts?.id) {
      console.error('Google Identity Services is not fully available after loading');
      throw new Error('Google Identity Services not available');
    }

    console.log('Google Identity Services is available, initializing...');
    window.google.accounts.id.disableAutoSelect();

    const nextConfig = {
      clientId,
      mode: isAdmin ? 'admin' : 'user',
    };

    if (
      !initializedGoogleConfig ||
      initializedGoogleConfig.clientId !== nextConfig.clientId ||
      initializedGoogleConfig.mode !== nextConfig.mode
    ) {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: isAdmin ? handleAdminGoogleAuth : handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
        use_fedcm_for_prompt: false // <--- FIX: Bypass strict FedCM origin rules on localhost to prevent 403s
      });
      initializedGoogleConfig = nextConfig;
      console.log('Google Identity Services initialized');
    } else {
      console.log('Google Identity Services already initialized for this configuration');
    }

    await new Promise((resolve) => setTimeout(resolve, 100));

    console.log('Rendering Google Sign-In button...');
    targetElement.innerHTML = '';
    
    // Calculate a responsive width based on the container, maxing out at 400px
    const containerWidth = targetElement.clientWidth > 0 ? targetElement.clientWidth : (window.innerWidth - 80);
    const buttonWidth = Math.min(400, containerWidth);

    window.google.accounts.id.renderButton(targetElement, {
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'rectangular',
      logo_alignment: 'left',
      width: buttonWidth
    });

    console.log('Google Sign-In button rendered successfully');
  } catch (error) {
    console.error('Failed to setup Google Sign-In button:', error);
    throw error;
  }
};

export const signOutFromGoogle = () => {
  if (window.google?.accounts?.id) {
    window.google.accounts.id.disableAutoSelect();

    if (window.google.accounts.id.revoke) {
      window.google.accounts.id.revoke();
    }
  }

  localStorage.removeItem('user-token');
  localStorage.removeItem('admin-token');
  localStorage.removeItem('user');
  localStorage.removeItem('admin');
  localStorage.removeItem('userAuth');
  localStorage.removeItem('adminAuth');

  console.log('Google OAuth cache cleared');
};

export const forceClearGoogleCache = () => {
  console.log('Force clearing Google OAuth cache...');

  document.cookie.split(';').forEach((cookie) => {
    if (cookie.trim().startsWith('__Secure-') || cookie.includes('google') || cookie.includes('gsi')) {
      const cookieName = cookie.split('=')[0].trim();
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname}`;
      console.log('Cleared cookie:', cookieName);
    }
  });

  if (window.google?.accounts?.id) {
    window.google.accounts.id.disableAutoSelect();
  }

  signOutFromGoogle();
  console.log('Google OAuth cache force cleared. Please refresh the page.');
};
