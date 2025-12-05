import axios from 'axios';
import { getSession } from '../utils/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

// Public axios instance for tablet - tries to use existing auth if available
// Used for in-room tablet and other public-facing features
const axiosPublic = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    // Add a special header to identify tablet requests
    'X-Tablet-Request': 'true',
  },
});

// Request interceptor - add auth token if available (for demo/testing)
axiosPublic.interceptors.request.use(
  (config) => {
    const token = getSession();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - no auth redirect for public instance
axiosPublic.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log errors but don't redirect
    if (error.response?.status === 401) {
      console.warn('Public API request unauthorized - backend may need to allow this endpoint');
    }
    return Promise.reject(error);
  }
);

export default axiosPublic;
