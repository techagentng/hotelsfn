import { useRouter } from 'next/router';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { fadeInUp, fadeInLeft, fadeInRight, scaleIn } from '../utils/animations';
import AnimatedWrapper from '../components/AnimatedWrapper';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from '../hooks/useTranslation';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export default function Login() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URL;
    const scope = 'openid email profile https://www.googleapis.com/auth/user.phonenumbers.read';
    const responseType = 'code';
    const state = encodeURIComponent(JSON.stringify({ redirectTo: '/dashboard' }));

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri || ''
    )}&response_type=${responseType}&scope=${encodeURIComponent(scope)}&state=${state}&access_type=offline&prompt=consent`;
    
    window.location.href = googleAuthUrl;
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - 60% - Image and Grid Background */}
      <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden">
        {/* Grid Background */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            backgroundColor: 'var(--bg-tertiary)',
          }}
        />
        
        {/* Overlay Gradient */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
            opacity: 0.1,
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-center">
          <AnimatedWrapper variants={fadeInLeft} delay={0.2}>
            <motion.div
              className="w-24 h-24 rounded-2xl flex items-center justify-center mb-8 overflow-hidden"
              style={{ backgroundColor: 'var(--accent-primary)' }}
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
            >
              <Image src="/logo.png" alt="IWEApp Logo" width={64} height={64} className="object-contain" />
            </motion.div>
          </AnimatedWrapper>

          <AnimatedWrapper variants={fadeInLeft} delay={0.3}>
            <h1 className="text-5xl font-bold mb-6">
              Welcome to{' '}
              <span style={{ color: 'var(--accent-primary)' }}>IWEApp</span>
            </h1>
          </AnimatedWrapper>

          <AnimatedWrapper variants={fadeInLeft} delay={0.4}>
            <p 
              className="text-xl mb-8 max-w-md"
              style={{ color: 'var(--text-secondary)' }}
            >
              Experience the power of modern web development with our cutting-edge platform.
            </p>
          </AnimatedWrapper>

          <AnimatedWrapper variants={fadeInLeft} delay={0.5}>
            <div className="grid grid-cols-3 gap-8 max-w-md">
              {[
                { number: '10K+', label: 'Active Users' },
                { number: '99.9%', label: 'Uptime' },
                { number: '24/7', label: 'Support' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <div 
                    className="text-3xl font-bold mb-2"
                    style={{ color: 'var(--accent-primary)' }}
                  >
                    {stat.number}
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }}>
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatedWrapper>
        </div>

        {/* Floating Elements */}
        <motion.div
          className="absolute top-20 left-20 w-32 h-32 rounded-full opacity-20"
          style={{ backgroundColor: 'var(--accent-primary)' }}
          animate={{ 
            y: [0, -20, 0],
            x: [0, 10, 0],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-24 h-24 rounded-full opacity-20"
          style={{ backgroundColor: 'var(--accent-secondary)' }}
          animate={{ 
            y: [0, 15, 0],
            x: [0, -15, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Right Side - 40% - Login Form */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md">
          <AnimatedWrapper variants={fadeInRight} delay={0.2}>
            <div className="text-center mb-12">
              <motion.div
                className="inline-block p-4 rounded-2xl mb-6"
                style={{ backgroundColor: 'var(--bg-secondary)' }}
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <Image src="/logo.png" alt="IWEApp Logo" width={80} height={80} className="object-contain" />
              </motion.div>
              <h2 className="text-4xl font-bold mb-3">{t('login.welcomeBack')}</h2>
              <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                Sign in to continue to IWEApp
              </p>
            </div>
          </AnimatedWrapper>

          <AnimatedWrapper variants={fadeInUp} delay={0.3}>
            <div className="space-y-4">
              {/* Google Login Button */}
              <motion.button
                onClick={handleGoogleLogin}
                className="w-full py-4 px-6 rounded-xl border-2 flex items-center justify-center gap-3 font-medium transition-all"
                style={{ 
                  borderColor: 'var(--border-color)',
                  backgroundColor: 'var(--bg-secondary)',
                }}
                disabled={isLoading}
                whileHover={{ scale: 1.02, borderColor: 'var(--accent-primary)' }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-6 h-6 border-2 border-t-transparent rounded-full"
                    style={{ borderColor: 'var(--accent-primary)' }}
                  />
                ) : (
                  <>
                    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <span className="text-base">Continue with Google</span>
                  </>
                )}
              </motion.button>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" style={{ borderColor: 'var(--border-color)' }}></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)' }}>
                    Secure authentication with Google
                  </span>
                </div>
              </div>

              {/* Info Box */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="p-4 rounded-xl text-sm text-center"
                style={{ backgroundColor: 'var(--bg-secondary)' }}
              >
                <p style={{ color: 'var(--text-secondary)' }}>
                  By continuing, you agree to our Terms of Service and Privacy Policy
                </p>
              </motion.div>
            </div>
          </AnimatedWrapper>
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}