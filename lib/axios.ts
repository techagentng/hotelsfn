import axios from 'axios';
import { getSession } from '../utils/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  // Don't set default Content-Type - let each request set its own
  // (FormData needs multipart/form-data, JSON needs application/json)
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from storage
    const token = getSession();
    
    // If token exists, add it to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Pages that should not redirect to login on 401
const noAuthRedirectPages = ['/inroomtablet'];

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      console.error('Unauthorized request - redirecting to login');
      
      // Clear session and redirect, but skip for certain pages
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        const shouldSkipRedirect = noAuthRedirectPages.some(page => currentPath.startsWith(page));
        
        if (!shouldSkipRedirect) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_role');
          localStorage.removeItem('user_data');
          
          // Redirect to login page
          window.location.href = '/login';
        }
      }
    }
    
    // Handle 403 Forbidden errors
    if (error.response?.status === 403) {
      console.error('Forbidden - insufficient permissions');
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
