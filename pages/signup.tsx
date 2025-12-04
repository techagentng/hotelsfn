import { useRouter } from 'next/router';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { fadeInUp, fadeInLeft, fadeInRight, scaleIn } from '../utils/animations';
import AnimatedWrapper from '../components/AnimatedWrapper';
import { Eye, EyeOff, Lock, Mail, User, Zap, ArrowRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '../hooks/useTranslation';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export default function Signup() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!formData.email.includes('@')) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate successful signup
    setIsSuccess(true);
    
    setTimeout(() => {
      router.push('/login');
    }, 2000);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8"
        >
          <motion.div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: 'var(--accent-primary)' }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
          >
            <CheckCircle className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-3xl font-bold mb-4">Account Created! 🎉</h2>
          <p style={{ color: 'var(--text-secondary)' }} className="mb-6">
            Your account has been successfully created. Redirecting to login...
          </p>
          <motion.div
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full mx-auto" />
          </motion.div>
        </motion.div>
      </div>
    );
  }

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
              className="w-24 h-24 rounded-2xl flex items-center justify-center mb-8"
              style={{ backgroundColor: 'var(--accent-primary)' }}
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
            >
              <Zap className="w-12 h-12 text-white" />
            </motion.div>
          </AnimatedWrapper>

          <AnimatedWrapper variants={fadeInLeft} delay={0.3}>
            <h1 className="text-5xl font-bold mb-6">
              {t('signup.joinThousands')}{' '}
              <span style={{ color: 'var(--accent-primary)' }}>IWEApp</span>
            </h1>
          </AnimatedWrapper>

          <AnimatedWrapper variants={fadeInLeft} delay={0.4}>
            <p 
              className="text-xl mb-8 max-w-md"
              style={{ color: 'var(--text-secondary)' }}
            >
              {t('landing.readyToStartDesc')}
            </p>
          </AnimatedWrapper>

          <AnimatedWrapper variants={fadeInLeft} delay={0.5}>
            <div className="grid grid-cols-3 gap-8 max-w-md">
              {[
                { number: 'FREE', label: 'Get Started' },
                { number: '5MIN', label: 'Quick Setup' },
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
          style={{ backgroundColor: 'var(--accent-primary)' }}
          animate={{ 
            y: [0, 15, 0],
            x: [0, -15, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Right Side - 40% - Sign Up Form */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md">
          <AnimatedWrapper variants={fadeInRight} delay={0.2}>
            <div className="text-center mb-8">
              <motion.div
                className="inline-block p-3 rounded-xl mb-4"
                style={{ backgroundColor: 'var(--bg-secondary)' }}
                whileHover={{ scale: 1.05 }}
              >
                <User className="w-8 h-8" style={{ color: 'var(--accent-primary)' }} />
              </motion.div>
              <h2 className="text-3xl font-bold mb-2">{t('signup.createAccount')}</h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                {t('signup.joinThousands')}
              </p>
            </div>
          </AnimatedWrapper>

          <AnimatedWrapper variants={fadeInUp} delay={0.3}>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('signup.fullName')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
                  </div>
                  <input
                    type="text"
                    placeholder={t('signup.fullNamePlaceholder')}
                    style={{ paddingLeft: '3rem' }}
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`input w-full pl-10 ${errors.name ? 'border-red-500' : ''}`}
                    required
                  />
                </div>
                {errors.name && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm mt-1"
                    style={{ color: 'var(--accent-danger)' }}
                  >
                    {errors.name}
                  </motion.p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('signup.emailAddress')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
                  </div>
                  <input
                    type="email"
                    placeholder={t('signup.emailPlaceholder')}
                    style={{ paddingLeft: '3rem' }}
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`input w-full pl-10 ${errors.email ? 'border-red-500' : ''}`}
                    required
                  />
                </div>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm mt-1"
                    style={{ color: 'var(--accent-danger)' }}
                  >
                    {errors.email}
                  </motion.p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('signup.password')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('signup.passwordPlaceholder')}
                    style={{ paddingLeft: '3rem' }}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`input w-full pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
                    ) : (
                      <Eye className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm mt-1"
                    style={{ color: 'var(--accent-danger)' }}
                  >
                    {errors.password}
                  </motion.p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('signup.confirmPassword')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder={t('signup.confirmPasswordPlaceholder')}
                    style={{ paddingLeft: '3rem' }}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`input w-full pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
                    ) : (
                      <Eye className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm mt-1"
                    style={{ color: 'var(--accent-danger)' }}
                  >
                    {errors.confirmPassword}
                  </motion.p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div>
                <label className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4 mt-1"
                    style={{ accentColor: 'var(--accent-primary)' }}
                    required
                  />
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {t('signup.agreeToTerms')}{' '}
                    <Link 
                      href="/terms"
                      className="hover-underline" 
                      style={{ color: 'var(--accent-primary)' }}
                    >
                      {t('signup.termsOfService')}
                    </Link>{' '}
                    {t('signup.and')}{' '}
                    <Link 
                      href="/privacy"
                      className="hover-underline" 
                      style={{ color: 'var(--accent-primary)' }}
                    >
                      {t('signup.privacyPolicy')}
                    </Link>
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                className="btn-primary w-full py-3 flex items-center justify-center gap-2"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    {t('signup.createAccountBtn')}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </form>
          </AnimatedWrapper>

          {/* Sign In Link */}
          <AnimatedWrapper variants={fadeInUp} delay={0.4}>
            <div className="mt-8 text-center">
              <p style={{ color: 'var(--text-secondary)' }}>
                Already have an account?{' '}
                <Link 
                  href="/login"
                  className="font-medium hover-underline"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  Sign in
                </Link>
              </p>
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
