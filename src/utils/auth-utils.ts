/**
 * Development authentication utilities
 * These are only used in development mode
 */

/**
 * Store the JWT token in localStorage for WebSocket authentication
 * Only used in development mode
 */
export const setDevAuthToken = (token: string): void => {
  if (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined') {
    localStorage.setItem('dev_jwt', token);
  }
};

/**
 * Clear the development JWT token
 */
export const clearDevAuthToken = (): void => {
  if (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined') {
    localStorage.removeItem('dev_jwt');
  }
};
