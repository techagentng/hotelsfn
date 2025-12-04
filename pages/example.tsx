import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@/contexts/ThemeContext';
import ThemeToggle from '@/components/ThemeToggle';
import AnimatedWrapper from '@/components/AnimatedWrapper';
import {
  fadeInUp,
  fadeInLeft,
  fadeInRight,
  staggerContainer,
  staggerItem,
  scaleIn,
} from '@/utils/animations';

// Example API fetch function
const fetchExampleData = async () => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return {
    title: 'React Query Example',
    description: 'This data was fetched using React Query!',
    items: ['Item 1', 'Item 2', 'Item 3', 'Item 4'],
  };
};

export default function ExamplePage() {
  const { theme } = useTheme();

  // React Query example
  const { data, isLoading, error } = useQuery({
    queryKey: ['exampleData'],
    queryFn: fetchExampleData,
  });

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with Theme Toggle */}
        <motion.div
          className="flex justify-between items-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold">
            Setup Example
          </h1>
          <ThemeToggle />
        </motion.div>

        {/* Current Theme Display */}
        <AnimatedWrapper variants={fadeInUp} delay={0.1}>
          <div className="card mb-8">
            <h2 className="text-2xl font-semibold mb-2">Current Theme</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Active theme: <span className="font-bold">{theme}</span>
            </p>
          </div>
        </AnimatedWrapper>

        {/* React Query Example */}
        <AnimatedWrapper variants={fadeInUp} delay={0.2}>
          <div className="card mb-8">
            <h2 className="text-2xl font-semibold mb-4">React Query Demo</h2>
            {isLoading && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-8 h-8 border-4 rounded-full"
                style={{ borderColor: 'var(--accent-primary)', borderTopColor: 'transparent' }}
              />
            )}
            {error && (
              <p style={{ color: 'var(--accent-danger)' }}>
                Error loading data
              </p>
            )}
            {data && (
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                <motion.h3 variants={staggerItem} className="text-xl font-semibold mb-2">
                  {data.title}
                </motion.h3>
                <motion.p variants={staggerItem} className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                  {data.description}
                </motion.p>
                <motion.ul variants={staggerItem} className="space-y-2">
                  {data.items.map((item, index) => (
                    <motion.li
                      key={index}
                      variants={staggerItem}
                      className="p-3 rounded-md"
                      style={{ backgroundColor: 'var(--bg-tertiary)' }}
                    >
                      {item}
                    </motion.li>
                  ))}
                </motion.ul>
              </motion.div>
            )}
          </div>
        </AnimatedWrapper>

        {/* Animation Examples Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <AnimatedWrapper variants={fadeInLeft} delay={0.3}>
            <div className="card">
              <h3 className="text-xl font-semibold mb-2">Fade In Left</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                This card animates from the left
              </p>
            </div>
          </AnimatedWrapper>

          <AnimatedWrapper variants={scaleIn} delay={0.4}>
            <div className="card">
              <h3 className="text-xl font-semibold mb-2">Scale In</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                This card scales in from center
              </p>
            </div>
          </AnimatedWrapper>

          <AnimatedWrapper variants={fadeInRight} delay={0.5}>
            <div className="card">
              <h3 className="text-xl font-semibold mb-2">Fade In Right</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                This card animates from the right
              </p>
            </div>
          </AnimatedWrapper>
        </motion.div>

        {/* Interactive Buttons */}
        <AnimatedWrapper variants={fadeInUp} delay={0.6}>
          <div className="card">
            <h2 className="text-2xl font-semibold mb-4">Interactive Elements</h2>
            <div className="flex flex-wrap gap-4">
              <motion.button
                className="btn-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Primary Button
              </motion.button>
              <motion.button
                className="btn-secondary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Secondary Button
              </motion.button>
              <motion.button
                className="px-4 py-2 rounded-md font-medium text-white"
                style={{ backgroundColor: 'var(--accent-success)' }}
                whileHover={{ scale: 1.05, rotate: 2 }}
                whileTap={{ scale: 0.95, rotate: -2 }}
              >
                Success Button
              </motion.button>
            </div>
          </div>
        </AnimatedWrapper>

        {/* Input Example */}
        <AnimatedWrapper variants={fadeInUp} delay={0.7} className="mt-8">
          <div className="card">
            <h2 className="text-2xl font-semibold mb-4">Form Elements</h2>
            <input
              type="text"
              placeholder="Try typing here..."
              className="input w-full"
            />
          </div>
        </AnimatedWrapper>
      </div>
    </div>
  );
}
