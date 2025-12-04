import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import ThemeToggle from '@/components/ThemeToggle';
import AnimatedWrapper from '@/components/AnimatedWrapper';
import { fadeInUp, staggerContainer, staggerItem } from '@/utils/animations';
import { 
  Check, 
  X, 
  AlertCircle, 
  Info, 
  AlertTriangle,
  Star,
  Heart,
  ShoppingCart,
  User,
  Settings
} from 'lucide-react';

export default function ThemeShowcase() {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="flex justify-between items-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-4xl font-bold mb-2">Theme Showcase</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Copy-paste examples for your development
            </p>
          </div>
          <ThemeToggle />
        </motion.div>

        {/* Color Palette */}
        <AnimatedWrapper variants={fadeInUp} delay={0.1}>
          <section className="card mb-8">
            <h2 className="text-2xl font-bold mb-6">Color Palette</h2>
            
            {/* Background Colors */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Background Colors</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div 
                    className="h-24 rounded-lg border mb-2 flex items-center justify-center"
                    style={{ 
                      backgroundColor: 'var(--bg-primary)',
                      borderColor: 'var(--border-color)'
                    }}
                  >
                    <code className="text-sm">--bg-primary</code>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Main background
                  </p>
                </div>
                <div>
                  <div 
                    className="h-24 rounded-lg border mb-2 flex items-center justify-center"
                    style={{ 
                      backgroundColor: 'var(--bg-secondary)',
                      borderColor: 'var(--border-color)'
                    }}
                  >
                    <code className="text-sm">--bg-secondary</code>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Cards, panels
                  </p>
                </div>
                <div>
                  <div 
                    className="h-24 rounded-lg border mb-2 flex items-center justify-center"
                    style={{ 
                      backgroundColor: 'var(--bg-tertiary)',
                      borderColor: 'var(--border-color)'
                    }}
                  >
                    <code className="text-sm">--bg-tertiary</code>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Hover states, subtle backgrounds
                  </p>
                </div>
              </div>
            </div>

            {/* Text Colors */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Text Colors</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div 
                  className="p-4 rounded-lg border"
                  style={{ borderColor: 'var(--border-color)' }}
                >
                  <p style={{ color: 'var(--text-primary)' }} className="font-semibold mb-1">
                    Primary Text
                  </p>
                  <code className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    var(--text-primary)
                  </code>
                </div>
                <div 
                  className="p-4 rounded-lg border"
                  style={{ borderColor: 'var(--border-color)' }}
                >
                  <p style={{ color: 'var(--text-secondary)' }} className="font-semibold mb-1">
                    Secondary Text
                  </p>
                  <code className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    var(--text-secondary)
                  </code>
                </div>
                <div 
                  className="p-4 rounded-lg border"
                  style={{ borderColor: 'var(--border-color)' }}
                >
                  <p style={{ color: 'var(--text-tertiary)' }} className="font-semibold mb-1">
                    Tertiary Text
                  </p>
                  <code className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    var(--text-tertiary)
                  </code>
                </div>
              </div>
            </div>

            {/* Accent Colors */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Accent Colors</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { name: 'Primary', var: '--accent-primary' },
                  { name: 'Secondary', var: '--accent-secondary' },
                  { name: 'Success', var: '--accent-success' },
                  { name: 'Danger', var: '--accent-danger' },
                  { name: 'Warning', var: '--accent-warning' },
                  { name: 'Info', var: '--accent-info' },
                ].map((color) => (
                  <div key={color.var}>
                    <div 
                      className="h-16 rounded-lg mb-2"
                      style={{ backgroundColor: `var(${color.var})` }}
                    />
                    <p className="text-sm font-medium">{color.name}</p>
                    <code className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      {color.var}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </AnimatedWrapper>

        {/* Typography Examples */}
        <AnimatedWrapper variants={fadeInUp} delay={0.2}>
          <section className="card mb-8">
            <h2 className="text-2xl font-bold mb-6">Typography</h2>
            <div className="space-y-4">
              <div>
                <h1 className="text-4xl font-bold">Heading 1 - 4xl</h1>
                <code className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  className="text-4xl font-bold"
                </code>
              </div>
              <div>
                <h2 className="text-3xl font-bold">Heading 2 - 3xl</h2>
                <code className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  className="text-3xl font-bold"
                </code>
              </div>
              <div>
                <h3 className="text-2xl font-semibold">Heading 3 - 2xl</h3>
                <code className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  className="text-2xl font-semibold"
                </code>
              </div>
              <div>
                <h4 className="text-xl font-semibold">Heading 4 - xl</h4>
                <code className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  className="text-xl font-semibold"
                </code>
              </div>
              <div>
                <p className="text-base">Body text - Regular paragraph text</p>
                <code className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  className="text-base"
                </code>
              </div>
              <div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Small text - Secondary information
                </p>
                <code className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  className="text-sm" style=&#123;&#123; color: 'var(--text-secondary)' &#125;&#125;
                </code>
              </div>
            </div>
          </section>
        </AnimatedWrapper>

        {/* Button Examples */}
        <AnimatedWrapper variants={fadeInUp} delay={0.3}>
          <section className="card mb-8">
            <h2 className="text-2xl font-bold mb-6">Buttons</h2>
            
            <div className="space-y-6">
              {/* Pre-built Buttons */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Pre-built Classes</h3>
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
                </div>
                <pre className="mt-3 p-3 rounded text-xs overflow-x-auto" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
{`<button className="btn-primary">Primary</button>
<button className="btn-secondary">Secondary</button>`}
                </pre>
              </div>

              {/* Custom Accent Buttons */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Custom Accent Buttons</h3>
                <div className="flex flex-wrap gap-4">
                  <motion.button
                    className="px-4 py-2 rounded-md font-medium text-white"
                    style={{ backgroundColor: 'var(--accent-success)' }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Check className="w-4 h-4 inline mr-2" />
                    Success
                  </motion.button>
                  <motion.button
                    className="px-4 py-2 rounded-md font-medium text-white"
                    style={{ backgroundColor: 'var(--accent-danger)' }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X className="w-4 h-4 inline mr-2" />
                    Danger
                  </motion.button>
                  <motion.button
                    className="px-4 py-2 rounded-md font-medium text-white"
                    style={{ backgroundColor: 'var(--accent-warning)' }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <AlertTriangle className="w-4 h-4 inline mr-2" />
                    Warning
                  </motion.button>
                  <motion.button
                    className="px-4 py-2 rounded-md font-medium text-white"
                    style={{ backgroundColor: 'var(--accent-info)' }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Info className="w-4 h-4 inline mr-2" />
                    Info
                  </motion.button>
                </div>
                <pre className="mt-3 p-3 rounded text-xs overflow-x-auto" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
{`<button 
  className="px-4 py-2 rounded-md font-medium text-white"
  style={{ backgroundColor: 'var(--accent-success)' }}
>
  Success
</button>`}
                </pre>
              </div>

              {/* Outline Buttons */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Outline Buttons</h3>
                <div className="flex flex-wrap gap-4">
                  <motion.button
                    className="px-4 py-2 rounded-md font-medium border-2"
                    style={{ 
                      borderColor: 'var(--accent-primary)',
                      color: 'var(--accent-primary)'
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Outline Primary
                  </motion.button>
                  <motion.button
                    className="px-4 py-2 rounded-md font-medium border-2"
                    style={{ 
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)'
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Outline Default
                  </motion.button>
                </div>
                <pre className="mt-3 p-3 rounded text-xs overflow-x-auto" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
{`<button 
  className="px-4 py-2 rounded-md font-medium border-2"
  style={{ 
    borderColor: 'var(--accent-primary)',
    color: 'var(--accent-primary)'
  }}
>
  Outline
</button>`}
                </pre>
              </div>

              {/* Icon Buttons */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Icon Buttons</h3>
                <div className="flex flex-wrap gap-4">
                  <motion.button
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: 'var(--bg-tertiary)' }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Heart className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: 'var(--bg-tertiary)' }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Star className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: 'var(--bg-tertiary)' }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ShoppingCart className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </div>
          </section>
        </AnimatedWrapper>

        {/* Card Examples */}
        <AnimatedWrapper variants={fadeInUp} delay={0.4}>
          <section className="card mb-8">
            <h2 className="text-2xl font-bold mb-6">Cards</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Simple Card */}
              <div className="card">
                <h3 className="text-xl font-semibold mb-2">Simple Card</h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Basic card with pre-built class
                </p>
                <pre className="mt-3 p-2 rounded text-xs overflow-x-auto" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
{`<div className="card">
  Content
</div>`}
                </pre>
              </div>

              {/* Card with Icon */}
              <div className="card">
                <div className="flex items-start gap-3">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: 'var(--accent-primary)' }}
                  >
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">With Icon</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>
                      Card with icon accent
                    </p>
                  </div>
                </div>
              </div>

              {/* Interactive Card */}
              <motion.div 
                className="card cursor-pointer"
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Settings className="w-8 h-8 mb-3" style={{ color: 'var(--accent-primary)' }} />
                <h3 className="text-xl font-semibold mb-2">Interactive</h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Hover me! With Framer Motion
                </p>
              </motion.div>
            </div>
          </section>
        </AnimatedWrapper>

        {/* Form Elements */}
        <AnimatedWrapper variants={fadeInUp} delay={0.5}>
          <section className="card mb-8">
            <h2 className="text-2xl font-bold mb-6">Form Elements</h2>
            
            <div className="space-y-6">
              {/* Text Input */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Text Input
                </label>
                <input 
                  type="text" 
                  placeholder="Enter text..."
                  className="input w-full"
                />
                <pre className="mt-2 p-2 rounded text-xs overflow-x-auto" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
{`<input className="input" placeholder="..." />`}
                </pre>
              </div>

              {/* Textarea */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Textarea
                </label>
                <textarea 
                  placeholder="Enter longer text..."
                  className="input w-full"
                  rows={4}
                />
              </div>

              {/* Select */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Select Dropdown
                </label>
                <select className="input w-full">
                  <option>Option 1</option>
                  <option>Option 2</option>
                  <option>Option 3</option>
                </select>
              </div>

              {/* Checkbox */}
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="check1"
                  className="w-4 h-4"
                  style={{ accentColor: 'var(--accent-primary)' }}
                />
                <label htmlFor="check1" className="text-sm">
                  Checkbox option
                </label>
              </div>

              {/* Radio */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input 
                    type="radio" 
                    id="radio1"
                    name="radio"
                    className="w-4 h-4"
                    style={{ accentColor: 'var(--accent-primary)' }}
                  />
                  <label htmlFor="radio1" className="text-sm">
                    Radio option 1
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="radio" 
                    id="radio2"
                    name="radio"
                    className="w-4 h-4"
                    style={{ accentColor: 'var(--accent-primary)' }}
                  />
                  <label htmlFor="radio2" className="text-sm">
                    Radio option 2
                  </label>
                </div>
              </div>
            </div>
          </section>
        </AnimatedWrapper>

        {/* Alert/Status Messages */}
        <AnimatedWrapper variants={fadeInUp} delay={0.6}>
          <section className="card mb-8">
            <h2 className="text-2xl font-bold mb-6">Alerts & Status Messages</h2>
            
            <div className="space-y-4">
              {/* Success Alert */}
              <div 
                className="p-4 rounded-lg border-l-4 flex items-start gap-3"
                style={{ 
                  backgroundColor: 'var(--bg-secondary)',
                  borderLeftColor: 'var(--accent-success)'
                }}
              >
                <Check className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--accent-success)' }} />
                <div>
                  <h4 className="font-semibold mb-1">Success!</h4>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Your action was completed successfully.
                  </p>
                </div>
              </div>

              {/* Error Alert */}
              <div 
                className="p-4 rounded-lg border-l-4 flex items-start gap-3"
                style={{ 
                  backgroundColor: 'var(--bg-secondary)',
                  borderLeftColor: 'var(--accent-danger)'
                }}
              >
                <X className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--accent-danger)' }} />
                <div>
                  <h4 className="font-semibold mb-1">Error!</h4>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Something went wrong. Please try again.
                  </p>
                </div>
              </div>

              {/* Warning Alert */}
              <div 
                className="p-4 rounded-lg border-l-4 flex items-start gap-3"
                style={{ 
                  backgroundColor: 'var(--bg-secondary)',
                  borderLeftColor: 'var(--accent-warning)'
                }}
              >
                <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--accent-warning)' }} />
                <div>
                  <h4 className="font-semibold mb-1">Warning!</h4>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Please review this information carefully.
                  </p>
                </div>
              </div>

              {/* Info Alert */}
              <div 
                className="p-4 rounded-lg border-l-4 flex items-start gap-3"
                style={{ 
                  backgroundColor: 'var(--bg-secondary)',
                  borderLeftColor: 'var(--accent-info)'
                }}
              >
                <Info className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--accent-info)' }} />
                <div>
                  <h4 className="font-semibold mb-1">Info</h4>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Here's some helpful information for you.
                  </p>
                </div>
              </div>

              <pre className="p-3 rounded text-xs overflow-x-auto" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
{`<div 
  className="p-4 rounded-lg border-l-4 flex items-start gap-3"
  style={{ 
    backgroundColor: 'var(--bg-secondary)',
    borderLeftColor: 'var(--accent-success)'
  }}
>
  <Check className="w-5 h-5" style={{ color: 'var(--accent-success)' }} />
  <div>
    <h4 className="font-semibold mb-1">Success!</h4>
    <p style={{ color: 'var(--text-secondary)' }}>Message</p>
  </div>
</div>`}
              </pre>
            </div>
          </section>
        </AnimatedWrapper>

        {/* Lists */}
        <AnimatedWrapper variants={fadeInUp} delay={0.7}>
          <section className="card mb-8">
            <h2 className="text-2xl font-bold mb-6">Lists</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Simple List */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Simple List</h3>
                <ul className="space-y-2">
                  {['Item 1', 'Item 2', 'Item 3', 'Item 4'].map((item, i) => (
                    <li 
                      key={i}
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: 'var(--bg-tertiary)' }}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Interactive List */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Interactive List</h3>
                <ul className="space-y-2">
                  {['Item 1', 'Item 2', 'Item 3', 'Item 4'].map((item, i) => (
                    <motion.li 
                      key={i}
                      className="p-3 rounded-lg cursor-pointer"
                      style={{ backgroundColor: 'var(--bg-tertiary)' }}
                      whileHover={{ 
                        scale: 1.02,
                        backgroundColor: 'var(--bg-secondary)'
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </AnimatedWrapper>

        {/* Badges */}
        <AnimatedWrapper variants={fadeInUp} delay={0.8}>
          <section className="card">
            <h2 className="text-2xl font-bold mb-6">Badges & Tags</h2>
            
            <div className="flex flex-wrap gap-3">
              <span 
                className="px-3 py-1 rounded-full text-sm font-medium text-white"
                style={{ backgroundColor: 'var(--accent-primary)' }}
              >
                Primary
              </span>
              <span 
                className="px-3 py-1 rounded-full text-sm font-medium text-white"
                style={{ backgroundColor: 'var(--accent-success)' }}
              >
                Success
              </span>
              <span 
                className="px-3 py-1 rounded-full text-sm font-medium text-white"
                style={{ backgroundColor: 'var(--accent-danger)' }}
              >
                Danger
              </span>
              <span 
                className="px-3 py-1 rounded-full text-sm font-medium text-white"
                style={{ backgroundColor: 'var(--accent-warning)' }}
              >
                Warning
              </span>
              <span 
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{ 
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)'
                }}
              >
                Neutral
              </span>
            </div>

            <pre className="mt-4 p-3 rounded text-xs overflow-x-auto" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
{`<span 
  className="px-3 py-1 rounded-full text-sm font-medium text-white"
  style={{ backgroundColor: 'var(--accent-primary)' }}
>
  Badge
</span>`}
            </pre>
          </section>
        </AnimatedWrapper>
      </div>
    </div>
  );
}
