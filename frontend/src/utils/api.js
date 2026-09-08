// API Configuration for production / development
// In development, prefer an empty baseURL so `/api/...` requests use the Vite proxy.
// In production, fall back to the configured API host.
const API_BASE_URL = import.meta.env.DEV
  ? ''
  : (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'https://api.internkatta.com');

// Export API Base URL and helper for image URLs
export const getImageUrl = (path) => {
  if (!path || typeof path !== 'string') return '';
  if (path.startsWith('http') || path.startsWith('blob:') || path.startsWith('data:')) return path;
  
  // In development, we must use the proxy target explicitly for assets because 
  // Vite only proxies /api, not /uploads
  const baseUrl = import.meta.env.DEV 
    ? (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000')
    : (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'https://api.internkatta.com');
    
  // Remove any trailing slash from baseUrl
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  
  return `${cleanBaseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};

// Create axios instance with base configuration
import axios from 'axios';
import Swal from 'sweetalert2';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 3600000, // Increased timeout to 60 minutes for large file uploads
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth tokens
api.interceptors.request.use(
  (config) => {
    // Don't set Content-Type for FormData requests (let browser set it automatically)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    // Extract tokens from localStorage (check both formats)
    let adminToken = null;
    let userToken = null;
    
    // Check for admin token
    const adminAuth = localStorage.getItem('adminAuth');
    if (adminAuth) {
      try {
        const parsedAuth = JSON.parse(adminAuth);
        if (parsedAuth.token && parsedAuth.admin && parsedAuth.admin.role === 'admin') {
          adminToken = parsedAuth.token;
        }
      } catch (e) {
        // Silent fail - invalid JSON
      }
    }
    
    // Check for user token
    const userAuth = localStorage.getItem('userAuth');
    if (userAuth) {
      try {
        const parsedAuth = JSON.parse(userAuth);
        if (parsedAuth.token && parsedAuth.user && parsedAuth.user.role === 'user') {
          userToken = parsedAuth.token;
        }
      } catch (e) {
        // Silent fail - invalid JSON
      }
    }
    
    // Determine which token to use based on the request URL
    // Admin routes are more specific and should take precedence
    const isAdminRoute = config.url && (
      config.url.includes('/api/admin/') ||
      config.url.includes('/admin/') ||
      config.url.includes('/api/v1/internships/all') ||
      config.url.includes('/api/v1/internships/create') ||
      config.url.includes('/api/v1/internships/update/') ||
      config.url.includes('/api/v1/internships/delete/') ||
      config.url.includes('/api/dashboard/') ||
      config.url.includes('/api/v1/internships/submissions/') ||
      config.url.includes('/api/v1/internship-category/') ||
      config.url.includes('/api/v1/courses/') ||
      config.url.includes('/api/v1/categories/') ||
      // ✅ FIXED: Only POST/PUT/DELETE for courses as admin, and exclude user-data & progress routes
      (config.url.includes('/api/courses/') &&
        !config.url.includes('/user-data/') &&
        !config.url.includes('/progress') &&
        (config.method === 'post' || config.method === 'put' || config.method === 'delete')) ||
      // Add support for categories admin operations (POST, PUT, DELETE)
      (config.url.includes('/api/categories/') && (config.method === 'post' || config.method === 'put' || config.method === 'delete')) ||
      // Add coupon admin routes (create, read, update, delete - but not validate/apply)
      (config.url.includes('/api/coupons/') && !config.url.includes('/validate') && !config.url.includes('/apply'))
    );
    
    const isUserRoute = config.url && (
      config.url.includes('/api/users/') ||
      // ✅ FIXED: All GET requests for courses are user routes (including user-data, progress)
      (config.url.includes('/api/courses/') && config.method === 'get') ||
      // Only include GET requests for categories as user routes (exclude admin operations)
      (config.url.includes('/api/categories/') && config.method === 'get' && !isAdminRoute) ||
      config.url.includes('/api/internships/') ||
      config.url.includes('/api/v1/internships/user-data/') ||
      config.url.includes('/api/payment/') ||
      (config.url.includes('/api/notifications') && !config.url.includes('/admin')) ||
      // Add coupon user routes (validate and apply)
      (config.url.includes('/api/coupons/') && (config.url.includes('/validate') || config.url.includes('/apply')))
    );
    
    // Set appropriate headers based on route type and available tokens
    if (isAdminRoute && adminToken) {
      // Admin route with admin token
      config.headers['admin-authorization'] = `Bearer ${adminToken}`;
      config.headers['authorization'] = `Bearer ${adminToken}`;
    } else if (isUserRoute && userToken) {
      // User route with user token
      config.headers['user-authorization'] = `Bearer ${userToken}`;
      config.headers['authorization'] = `Bearer ${userToken}`;
    } else if (adminToken && !isUserRoute && !isAdminRoute) {
      // Fallback: admin token for neutral routes (like general API calls)
      config.headers['admin-authorization'] = `Bearer ${adminToken}`;
      config.headers['authorization'] = `Bearer ${adminToken}`;
    } else if (userToken && !isAdminRoute && !isUserRoute) {
      // Fallback: user token for neutral routes
      config.headers['user-authorization'] = `Bearer ${userToken}`;
      config.headers['authorization'] = `Bearer ${userToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('API Error Interceptor - Full Error Object:', error);
    console.log('API Error Interceptor - Status:', error.response?.status);
    console.log('API Error Interceptor - URL:', error.config?.url);
    console.log('API Error Interceptor - Method:', error.config?.method);
    console.log('API Error Interceptor - Headers sent:', error.config?.headers);
    console.log('API Error Interceptor - Error message:', error.message);
    console.log('API Error Interceptor - Error code:', error.code);
    
    // Enhanced 401 error handling
    if (error.response?.status === 401) {
      console.log('API Error Interceptor - 401 Unauthorized Error');
      console.log('API Error Interceptor - Request headers:', error.config?.headers);
      
      // Check if this is a login request - don't redirect on login failures
      const isLoginRequest = error.config?.url?.includes('/login') || 
                           error.config?.url?.includes('/admin/login') ||
                           error.config?.url?.includes('/users/login');
      
      console.log('API Error Interceptor - Is Login Request:', isLoginRequest);
      
      if (!isLoginRequest) {
        console.log('API Error Interceptor - Non-login request failed with 401');
        console.log('API Error Interceptor - Checking authentication state...');
        
        // Log current authentication state
        const adminAuth = localStorage.getItem('adminAuth');
        const userAuth = localStorage.getItem('userAuth');
        
        // Parse the auth objects to check for tokens
        let adminTokenExists = false;
        let userTokenExists = false;
        
        if (adminAuth) {
          try {
            const parsedAdminAuth = JSON.parse(adminAuth);
            adminTokenExists = !!(parsedAdminAuth.token && parsedAdminAuth.admin);
          } catch (e) {
            console.log('Admin auth parse error in error interceptor:', e);
          }
        }
        
        if (userAuth) {
          try {
            const parsedUserAuth = JSON.parse(userAuth);
            userTokenExists = !!(parsedUserAuth.token && parsedUserAuth.user);
          } catch (e) {
            console.log('User auth parse error in error interceptor:', e);
          }
        }
        
        console.log('API Error Interceptor - Admin Auth exists:', !!adminAuth);
        console.log('API Error Interceptor - User Auth exists:', !!userAuth);
        console.log('API Error Interceptor - Admin Token exists:', adminTokenExists);
        console.log('API Error Interceptor - User Token exists:', userTokenExists);
        
        // Show SweetAlert popup for authentication failure (only once)
        // Use a flag to prevent multiple popups from multiple simultaneous requests
        if (!window.authErrorPopupShown) {
          window.authErrorPopupShown = true;
          Swal.fire({
            title: 'Authentication Failed',
            text: 'Your session has expired. Please login again.',
            icon: 'error',
            confirmButtonText: 'Go to Login',
            confirmButtonColor: '#dc2626',
            allowOutsideClick: false,
            allowEscapeKey: false
          }).then(() => {
            // Clear auth data
            localStorage.removeItem('adminAuth');
            localStorage.removeItem('userAuth');
            // Reset flag after navigation
            window.authErrorPopupShown = false;
            // Navigate to login page
            if (window.location.pathname !== '/login' && window.location.pathname !== '/admin/login') {
              window.location.href = '/login';
            }
          });
        }
      } else {
        console.log('API Error Interceptor - Login request failed, not redirecting');
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL };