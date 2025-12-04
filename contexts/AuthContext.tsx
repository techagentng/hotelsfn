import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { AuthContextType, AuthState, User, GoogleLoginResponse } from '../types/auth';
import { setSession, clearSession, getSession, getUserRole, getUserData } from '../utils/auth';
import { setDevAuthToken, clearDevAuthToken } from '../src/utils/auth-utils';

// Create context with undefined default
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider props
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const router = useRouter();
  
  const [state, setState] = useState<AuthState>({
    isLoggedIn: false,
    isInitialized: false,
    user: null,
    role_name: null,
  });

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = getSession();
        const role = getUserRole();
        const userData = getUserData();

        if (token && userData) {
          setState({
            isLoggedIn: true,
            isInitialized: true,
            user: userData,
            role_name: role,
          });
        } else {
          setState({
            isLoggedIn: false,
            isInitialized: true,
            user: null,
            role_name: null,
          });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setState({
          isLoggedIn: false,
          isInitialized: true,
          user: null,
          role_name: null,
        });
      }
    };

    initializeAuth();
  }, []);

  /**
   * Google login function
   * Sends user data to backend and handles authentication
   */
  const googleLogin = async (
    email: string,
    fullname: string,
    telephone: string
  ): Promise<void> => {
    try {
      // Ensure the backend URL doesn't end with a slash
      let backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '');
      
      console.log('🔧 Backend URL:', backendUrl);
      
      if (!backendUrl) {
        console.error('❌ Backend API URL is not configured!');
        throw new Error('Backend API URL is not configured');
      }

      // If the backend URL already includes /api/v1, don't add it again
      const apiPath = backendUrl.includes('/api/v1') ? '' : '/api/v1';
      const loginUrl = `${backendUrl}${apiPath}/google/user/login`;
      
      console.log('📤 Sending login request to:', loginUrl);
      console.log('📦 Payload:', { email, fullname, telephone });

      // Configure axios to include credentials (cookies) in the request
      const axiosConfig = {
        withCredentials: true, // This ensures cookies are sent with the request
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      };

      // Send email, fullname, and telephone to the backend
      const response = await axios.post<{ data: GoogleLoginResponse }>(
        loginUrl,
        {
          email,
          fullname,
          telephone,
        },
        axiosConfig
      );
      
      console.log('🔑 Login response headers:', response.headers);

      console.log('📥 Backend response:', response.data);

      // Extract data from the response with safe fallbacks
      const responseData = response.data.data;
      
      if (!responseData) {
        throw new Error('Invalid response structure from backend');
      }

      const access_token = responseData.access_token;
      const role_name = responseData.role_name || 'User';
      
      // Construct user object with safe fallbacks using response data
      const user: User = {
        id: responseData.id?.toString() || email,
        email: responseData.email || email,
        fullname: responseData.fullname || fullname,
        username: responseData.username || email.split('@')[0],
        telephone: responseData.telephone || telephone,
        role_name: role_name,
      };

      console.log('👤 Constructed user object:', user);

      // Set the session with the received token and user data
      setSession(
        access_token,
        role_name,
        user  // Pass the constructed user object
      );

      // Update the auth state
      setState({
        isLoggedIn: true,
        isInitialized: true,
        user: user,
        role_name: role_name,
      });

      // Set session with the user data
      setSession(access_token, role_name, user);

      // Store the auth state in localStorage for WebSocket access
      if (typeof window !== 'undefined') {
        try {
          const authState = {
            token: access_token,
            user: user,  // Use the constructed user object
            role: role_name,
            timestamp: Date.now()
          };
          localStorage.setItem('auth_state', JSON.stringify(authState));
          
          // Also set the dev auth token for development
          if (process.env.NODE_ENV === 'development') {
            setDevAuthToken(access_token);
          }
        } catch (error) {
          console.error('Error storing auth state:', error);
        }
      }

      // Navigate to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Google Login error:', error);
      
      // Clear any partial session data
      clearSession();
      
      setState({
        isLoggedIn: false,
        isInitialized: true,
        user: null,
        role_name: null,
      });
      
      throw error;
    }
  };

  /**
   * Logout function
   * Clears session and redirects to login
   */
  const logout = () => {
    // Clear session data
    clearSession();
    
    // Clear WebSocket auth state
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('auth_state');
        console.log('🔒 Removed WebSocket auth state');
      } catch (e) {
        console.warn('Failed to clear WebSocket auth state', e);
      }
    }
    
    // Clear development WebSocket token
    if (process.env.NODE_ENV !== 'production') {
      clearDevAuthToken();
    }
    
    // Reset auth state
    setState({
      isLoggedIn: false,
      isInitialized: true,
      user: null,
      role_name: null,
    });
    
    // Redirect to login page
    router.push('/login');
  };

  const value: AuthContextType = {
    ...state,
    googleLogin,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use auth context
 * Throws error if used outside AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;
