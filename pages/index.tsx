import { useState } from 'react';
import { motion } from 'framer-motion';
import { fadeInUp, fadeInLeft, fadeInRight, staggerContainer } from '../utils/animations';
import AnimatedWrapper from '../components/AnimatedWrapper';
import Navbar from '../components/Navbar';
import AnimatedSpotlight from '../components/AnimatedSpotlight';
import { ArrowRight, CheckCircle, Zap, BarChart3, Shield, Users, TrendingUp, Check } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '../hooks/useTranslation';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import LoginModal from '../components/LoginModal';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';

export default function Landing() {
  const { t } = useTranslation();
  const router = useRouter();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSuccess = (data: any) => {
    setSubmitSuccess(true);
    console.log('Form submitted successfully:', data);
    // You could show a success message or redirect here
  };

  const handleError = (error: string) => {
    setSubmitError(error);
    console.error('Form submission error:', error);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Navbar />
      
      {/* Animated Spotlights */}
      <AnimatedSpotlight
        fill="rgba(59, 130, 246, 0.08)"
        startX={0}
        startY={0}
        endX={50}
        endY={50}
        duration={4}
        delay={0}
      />
      <AnimatedSpotlight
        fill="rgba(139, 92, 246, 0.08)"
        startX={100}
        startY={0}
        endX={50}
        endY={50}
        duration={4}
        delay={1}
      />
      
      {/* Hero Section */}
      <section className="pt-20 md:pt-32 pb-16 md:pb-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <AnimatedWrapper variants={fadeInUp}>
            <motion.div
              className="inline-block px-3 md:px-4 py-1.5 md:py-2 rounded-full mb-4 md:mb-6"
              style={{ backgroundColor: 'var(--bg-secondary)' }}
            >
              <span className="text-xs md:text-sm font-medium" style={{ color: 'var(--accent-primary)' }}>
                ✨ {t('landing.welcome')}{' '}
               <span style={{ color: 'var(--accent-primary)' }}>IWEAPP</span>
              </span>
            </motion.div>
          </AnimatedWrapper>

          <AnimatedWrapper variants={fadeInUp} delay={0.1}>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 md:mb-6 leading-tight">
              {t('landing.welcome2')}{' '}
              {/* <span style={{ color: 'var(--accent-primary)' }}>IWEAPP</span> */}
            </h1>
          </AnimatedWrapper>

          <AnimatedWrapper variants={fadeInUp} delay={0.2}>
            <p 
              className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 md:mb-8 max-w-3xl mx-auto px-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              {t('landing.tagline')}
              {t('landing.subtagline')}
            </p>
          </AnimatedWrapper>

          <AnimatedWrapper variants={fadeInUp} delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center px-2">
              <button
                onClick={() => {
                  setSubmitError('');
                  setSubmitSuccess(false);
                  setIsLoginModalOpen(true);
                }}
                className="btn-primary text-base md:text-lg px-6 md:px-8 py-3 md:py-4 flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                {t('landing.getStarted')}
                <ArrowRight className="w-4 md:w-5 h-4 md:h-5" />
              </button>
              <Link href="/theme-showcase" className="w-full sm:w-auto">
                <motion.button
                  className="btn-secondary text-base md:text-lg px-6 md:px-8 py-3 md:py-4 w-full sm:w-auto"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {t('landing.viewShowcase')}
                </motion.button>
              </Link>
            </div>
          </AnimatedWrapper>

          <LoginModal
            isOpen={isLoginModalOpen}
            onClose={() => {
              setIsLoginModalOpen(false);
              setSubmitError('');
              setSubmitSuccess(false);
            }}
            onSuccess={handleSuccess}
            onError={handleError}
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="max-w-6xl mx-auto">
          <AnimatedWrapper variants={fadeInUp}>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              {t('landing.whyChooseUs')}
            </h2>
            <p 
              className="text-center text-lg mb-12 max-w-2xl mx-auto"
              style={{ color: 'var(--text-secondary)' }}
            >
              {t('landing.everythingYouNeed')}
            </p>
          </AnimatedWrapper>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="w-8 h-8" />,
                title: t('landing.lightningFast'),
                description: t('landing.lightningFastDesc'),
                color: 'var(--accent-primary)',
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: t('landing.secureReliable'),
                description: t('landing.secureReliableDesc'),
                color: 'var(--accent-success)',
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: t('landing.growBusiness'),
                description: t('landing.growBusinessDesc'),
                color: 'var(--accent-info)',
              },
            ].map((feature, index) => (
              <AnimatedWrapper key={feature.title} variants={fadeInUp} delay={0.1 * (index + 1)}>
                <motion.div
                  className="card h-full"
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <div
                    className="p-3 rounded-xl inline-block mb-4"
                    style={{ backgroundColor: 'var(--bg-tertiary)' }}
                  >
                    <div style={{ color: feature.color }}>
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    {feature.description}
                  </p>
                </motion.div>
              </AnimatedWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* Why Everyone Loves iWe Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <AnimatedWrapper variants={fadeInUp}>
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
              Why Everyone Loves <span style={{ color: 'var(--accent-primary)' }}>iWe</span>
            </h2>
          </AnimatedWrapper>

          <div className="space-y-8">
            {[
              {
                title: 'PDF or Photo Upload',
                description: 'Drag any bank statement. We read every line in seconds.',
                icon: '📄',
              },
              {
                title: 'Ask IWE Anything',
                description: 'Type or speak: "How much on transport?" → Get a chart + response instantly.',
                icon: '🤖',
              },
              {
                title: '100% For Nigeria & Global',
                description: '₦ currency, language toggle, voice input',
                icon: '🌍',
              },
            ].map((feature, index) => (
              <AnimatedWrapper key={feature.title} variants={fadeInUp} delay={0.1 * index}>
                <motion.div
                  className="card p-8 flex items-center gap-6"
                  whileHover={{ x: 8, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-5xl">{feature.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              </AnimatedWrapper>
            ))}
          </div>

          <AnimatedWrapper variants={fadeInUp} delay={0.4}>
            <div className="text-center mt-12">
              <Link href="#features">
                <motion.button
                  className="btn-secondary text-lg px-8 py-4 flex items-center gap-2 mx-auto"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Discover More Features
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
              <p className="mt-4 text-lg" style={{ color: 'var(--text-secondary)' }}>
                Invoicing, Bookkeeping, Inventory, Accounting – All in One.
              </p>
            </div>
          </AnimatedWrapper>
        </div>
      </section>

      {/* How iWe Works Section */}
      <section className="py-20 px-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="max-w-6xl mx-auto">
          <AnimatedWrapper variants={fadeInUp}>
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
              How iWe Works in <span style={{ color: 'var(--accent-primary)' }}>3 Steps</span>
            </h2>
          </AnimatedWrapper>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Upload Statement',
                description: 'PDF or photo. We extract every transaction instantly.',
                icon: '📤',
              },
              {
                step: '2',
                title: 'Ask IWE',
                description: '"Show transport" or "How much on data?" → Get a chart in seconds.',
                icon: '💬',
              },
              {
                step: '3',
                title: 'See & Act',
                description: 'Live dashboard. Tap to recategorize. Export anytime.',
                icon: '📊',
              },
            ].map((step, index) => (
              <AnimatedWrapper key={step.title} variants={fadeInUp} delay={0.1 * index}>
                <motion.div
                  className="text-center"
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  <div
                    className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center text-3xl font-bold text-white"
                    style={{ backgroundColor: 'var(--accent-primary)' }}
                  >
                    {step.step}
                  </div>
                  <div className="text-4xl mb-4">{step.icon}</div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    {step.description}
                  </p>
                </motion.div>
              </AnimatedWrapper>
            ))}
          </div>

          <AnimatedWrapper variants={fadeInUp} delay={0.4}>
            <div className="text-center mt-12">
              <Link href="#business">
                <motion.button
                  className="btn-secondary text-lg px-8 py-4 flex items-center gap-2 mx-auto"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Explore Business Tools
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
              <p className="mt-4 text-lg" style={{ color: 'var(--text-secondary)' }}>
                From invoicing clients to tracking inventory – scale effortlessly.
              </p>
            </div>
          </AnimatedWrapper>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <AnimatedWrapper variants={fadeInUp}>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to See Your <span style={{ color: 'var(--accent-primary)' }}>Money Clearly?</span>
            </h2>
            <div className="mb-8">
              <p className="text-2xl font-semibold mb-2">Start Free – No Card Required</p>
              <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                First 42 transactions on us. Upgrade anytime.
              </p>
            </div>
            <Link href="/signup">
              <motion.button
                className="btn-primary text-xl px-10 py-5 flex items-center gap-3 mx-auto"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Now
                <ArrowRight className="w-6 h-6" />
              </motion.button>
            </Link>
          </AnimatedWrapper>
        </div>
      </section>

      {/* Footer */}
      <footer 
        className="py-12 px-4 border-t"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <p style={{ color: 'var(--text-secondary)' }}>
              © 2025 iWe. Made in Nigeria
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row justify-center items-center gap-6 text-center">
            <div className="flex flex-wrap justify-center gap-6">
              <Link href="/privacy" className="hover:opacity-70 transition-opacity" style={{ color: 'var(--text-secondary)' }}>
                Privacy
              </Link>
              <Link href="/terms" className="hover:opacity-70 transition-opacity" style={{ color: 'var(--text-secondary)' }}>
                Terms
              </Link>
              <a href="mailto:hello@iweapps.com" className="hover:opacity-70 transition-opacity" style={{ color: 'var(--text-secondary)' }}>
                Support: hello@iweapps.com
              </a>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4">
              <span style={{ color: 'var(--text-secondary)' }}>More Features:</span>
              <span className="font-medium">Invoicing</span>
              <span className="font-medium">Bookkeeping</span>
              <span className="font-medium">Inventory</span>
              <span className="font-medium">Accounting</span>
            </div>
          </div>
        </div>
      </footer>
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