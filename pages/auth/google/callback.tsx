import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { GoogleTokenResponse, GoogleUser } from '../../../types/auth';

const GoogleCallback = () => {
  const router = useRouter();
  const { googleLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent multiple executions
    if (hasProcessed.current) {
      console.log('⏭️ Already processed, skipping...');
      return;
    }
    const handleGoogleCallback = async () => {
      console.log('🎯 Callback page loaded!');
      console.log('📍 Current URL:', window.location.href);
      
      // Get code from URL query params
      const queryParams = new URLSearchParams(window.location.search);
      const code = queryParams.get('code');
      const state = queryParams.get('state');
      const error = queryParams.get('error');

      console.log('🔍 URL params:', { code: code ? 'EXISTS' : 'MISSING', state, error });

      if (error) {
        console.error('❌ OAuth error from Google:', error);
        setError(`Google OAuth error: ${error}`);
        setTimeout(() => {
          router.push('/login');
        }, 3000);
        return;
      }

      if (!code) {
        console.error('❌ Authorization code not found.');
        setError('No authorization code received from Google');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
        return;
      }

      // Mark as processed to prevent re-execution
      hasProcessed.current = true;

      try {
        console.log('🔐 Starting OAuth token exchange...');
        console.log('Code:', code);
        console.log('Client ID:', process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
        console.log('Redirect URI:', process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URL);
        
        // Step 1: Exchange code for tokens
        const tokenResponse = await axios.post<GoogleTokenResponse>(
          'https://oauth2.googleapis.com/token',
          {
            code,
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
            client_secret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
            redirect_uri: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URL,
            grant_type: 'authorization_code',
          },
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        );

        console.log('✅ Token exchange successful');
        const { id_token, access_token } = tokenResponse.data;

        // Step 2: Decode ID token to get email and name
        const user: GoogleUser = jwtDecode(id_token);
        const userEmail = user.email;
        const userName = user.name || 'Google User'; // Fallback if name isn't provided
        console.log('👤 User info:', { email: userEmail, name: userName });

        // Step 3: Fetch phone number using People API (requires access_token)
        let userPhone = '';
        try {
          const peopleResponse = await axios.get(
            'https://people.googleapis.com/v1/people/me?personFields=phoneNumbers',
            {
              headers: {
                Authorization: `Bearer ${access_token}`,
              },
            }
          );
          userPhone = peopleResponse.data.phoneNumbers?.[0]?.value || '';
          console.log('📞 Phone number:', userPhone);
        } catch (phoneError) {
          console.warn('Failed to fetch phone number:', phoneError);
          // Proceed without phone number if unavailable
        }

        // Step 4: Call googleLogin with email, name, and phone
        console.log('🚀 Calling backend googleLogin...');
        await googleLogin(userEmail, userName, userPhone);
        console.log('✅ Login successful!');
      } catch (error: any) {
        console.error('❌ Authentication error:', error);
        console.error('Error details:', error.response?.data || error.message);
        console.error('Full error object:', JSON.stringify(error, null, 2));
        setError('Authentication failed. Please try again.');
        setIsLoading(false);
        
        setTimeout(() => {
          console.log('⏰ Redirecting to login...');
          router.push('/login');
        }, 3000);
      }
    };

    console.log('🔄 useEffect triggered. Router ready:', router.isReady);
    
    // Only run if router is ready
    if (router.isReady) {
      console.log('✅ Router is ready, calling handleGoogleCallback');
      handleGoogleCallback();
    } else {
      console.log('⏳ Waiting for router to be ready...');
    }
  }, [router.isReady, router, googleLogin]);

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--bg-primary)' }}
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
            className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--accent-danger)' }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Authentication Failed
          </h1>
          <p className="text-lg mb-4" style={{ color: 'var(--text-secondary)' }}>
            {error}
          </p>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--bg-primary)' }}
      >
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 mx-auto mb-6 border-4 border-t-transparent rounded-full"
            style={{ borderColor: 'var(--accent-primary)' }}
          />
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Authenticating...
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            Please wait while we sign you in
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default GoogleCallback;
