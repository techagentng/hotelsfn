import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '../utils/animations';
import AnimatedWrapper from '../components/AnimatedWrapper';
import Navbar from '../components/Navbar';
import { Check, ArrowRight, Zap, Shield, Crown } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '../hooks/useTranslation';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export default function Pricing() {
  const { t } = useTranslation();

  const plans = [
    {
      name: 'Starter',
      price: 'Free',
      description: 'Perfect for individuals and small businesses getting started',
      icon: <Zap className="w-6 h-6" />,
      color: 'var(--accent-primary)',
      features: [
        'Up to 42 transactions',
        'Basic analytics',
        'Email support',
        'Mobile app access',
        '1 user account',
      ],
      cta: 'Get Started',
      popular: false,
    },
    {
      name: 'Professional',
      price: '₦4,999',
      period: '/month',
      description: 'Ideal for growing businesses that need more power',
      icon: <Shield className="w-6 h-6" />,
      color: 'var(--accent-success)',
      features: [
        'Unlimited transactions',
        'Advanced analytics',
        'Priority support',
        'Mobile & desktop apps',
        'Up to 5 user accounts',
        'Custom reports',
        'API access',
      ],
      cta: 'Start Free Trial',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'Tailored solutions for large organizations',
      icon: <Crown className="w-6 h-6" />,
      color: 'var(--accent-warning)',
      features: [
        'Everything in Professional',
        'Unlimited users',
        'White-label options',
        'Dedicated account manager',
        'Custom integrations',
        'On-premise deployment',
        'SLA guarantee',
      ],
      cta: 'Contact Sales',
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <AnimatedWrapper variants={fadeInUp}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Simple, Transparent
              <br />
              <span style={{ color: 'var(--accent-primary)' }}>Pricing</span>
            </h1>
          </AnimatedWrapper>

          <AnimatedWrapper variants={fadeInUp} delay={0.1}>
            <p 
              className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto"
              style={{ color: 'var(--text-secondary)' }}
            >
              Choose the perfect plan for your business. Start free and scale as you grow.
            </p>
          </AnimatedWrapper>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <AnimatedWrapper key={plan.name} variants={fadeInUp} delay={0.1 * index}>
                <motion.div
                  className={`card p-8 h-full relative ${
                    plan.popular ? 'ring-2' : ''
                  }`}
                  style={{
                    borderColor: plan.popular ? plan.color : 'transparent',
                  }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  {plan.popular && (
                    <div
                      className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-sm font-medium text-white"
                      style={{ backgroundColor: plan.color }}
                    >
                      Most Popular
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <div
                      className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${plan.color}20` }}
                    >
                      <div style={{ color: plan.color }}>
                        {plan.icon}
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <div className="mb-4">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      {plan.period && (
                        <span style={{ color: 'var(--text-secondary)' }}>
                          {plan.period}
                        </span>
                      )}
                    </div>
                    <p style={{ color: 'var(--text-secondary)' }}>
                      {plan.description}
                    </p>
                  </div>

                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-3">
                        <div
                          className="p-1 rounded-full flex-shrink-0"
                          style={{ backgroundColor: 'var(--accent-success)' }}
                        >
                          <Check className="w-4 h-4 text-white" />
                        </div>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Link href="/signup">
                    <motion.button
                      className={`w-full py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 ${
                        plan.popular ? 'btn-primary' : 'btn-secondary'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {plan.cta}
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </Link>
                </motion.div>
              </AnimatedWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="max-w-4xl mx-auto">
          <AnimatedWrapper variants={fadeInUp}>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Frequently Asked Questions
            </h2>
          </AnimatedWrapper>

          <div className="space-y-6">
            {[
              {
                question: 'Can I change my plan later?',
                answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.',
              },
              {
                question: 'What payment methods do you accept?',
                answer: 'We accept bank transfers, debit cards, credit cards, and mobile payments for Nigerian customers.',
              },
              {
                question: 'Is there a free trial?',
                answer: 'Yes! Start with our free plan with 42 transactions. No credit card required.',
              },
              {
                question: 'Do you offer discounts?',
                answer: 'We offer annual billing discounts and special pricing for NGOs and educational institutions.',
              },
            ].map((faq, index) => (
              <AnimatedWrapper key={faq.question} variants={fadeInUp} delay={0.1 * index}>
                <motion.div
                  className="card p-6"
                  whileHover={{ x: 8 }}
                  transition={{ duration: 0.2 }}
                >
                  <h3 className="text-lg font-bold mb-3">{faq.question}</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>{faq.answer}</p>
                </motion.div>
              </AnimatedWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <AnimatedWrapper variants={fadeInUp}>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Get Started?
            </h2>
            <p 
              className="text-xl mb-8"
              style={{ color: 'var(--text-secondary)' }}
            >
              Join thousands of businesses already using iWe to manage their finances better.
            </p>
            <Link href="/signup">
              <motion.button
                className="btn-primary text-lg px-8 py-4 flex items-center gap-2 mx-auto"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Free
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </AnimatedWrapper>
        </div>
      </section>
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
