import Cookies from 'js-cookie';

// Session management constants
const TOKEN_KEY = 'auth_token';
const ROLE_KEY = 'user_role';
const USER_KEY = 'user_data';

/**
 * Set authentication session
 * Stores JWT token and user role in cookies and localStorage
 */
export const setSession = (token: string, roleName: string, userData?: any): void => {
  if (token) {
    Cookies.set(TOKEN_KEY, token, { expires: 7, secure: process.env.NODE_ENV === 'production' });
    
    Cookies.set(ROLE_KEY, roleName, { expires: 7, secure: process.env.NODE_ENV === 'production' });
    
    // Store in localStorage as backup
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(ROLE_KEY, roleName);
    
    // Store user data if provided
    if (userData) {
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
    }
  } else {
    clearSession();
  }
};

/**
 * Get authentication token from cookies or localStorage
 */
export const getSession = (): string | null => {
  // Try cookie first
  const cookieToken = Cookies.get(TOKEN_KEY);
  if (cookieToken) return cookieToken;
  
  // Fallback to localStorage
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  
  return null;
};

/**
 * Get user role from cookies or localStorage
 */
export const getUserRole = (): string | null => {
  // Try cookie first
  const cookieRole = Cookies.get(ROLE_KEY);
  if (cookieRole) return cookieRole;
  
  // Fallback to localStorage
  if (typeof window !== 'undefined') {
    return localStorage.getItem(ROLE_KEY);
  }
  return null;
};

/**
 * Get stored user data from localStorage
 */
export const getUserData = (): any | null => {
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }
  return null;
};

/**
 * Clear authentication session
 * Removes all auth-related data from cookies and localStorage
 */
export const clearSession = (): void => {
  // Remove cookies
  Cookies.remove(TOKEN_KEY);
  Cookies.remove(ROLE_KEY);
  
  // Remove from localStorage
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(USER_KEY);
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const token = getSession();
  return !!token;
};

/**
 * Legacy mock login function (kept for backward compatibility)
 */
export function mockLogin(username: string, password: string) {
  return username === 'admin' && password === 'password';
}