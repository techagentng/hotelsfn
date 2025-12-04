import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  Menu, 
  X,
  Zap,
  BarChart3,
  Users,
  CreditCard,
  FileText,
  Settings,
  HelpCircle,
  BookOpen
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from '../hooks/useTranslation';

interface DropdownItem {
  label: string;
  href: string;
  description?: string;
  icon?: React.ReactNode;
}

interface NavItem {
  label: string;
  href?: string;
  dropdown?: DropdownItem[];
}

export default function Navbar() {
  const { t } = useTranslation();
  const router = useRouter();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMouseEnter = (label: string) => {
    setActiveDropdown(label);
  };

  const handleMouseLeave = () => {
    setActiveDropdown(null);
  };

  const navItems: NavItem[] = [
    {
      label: t('navigation.products'),
      dropdown: [
        {
          label: t('navigation.dashboard'),
          href: '/dashboard',
          description: 'Overview of your business metrics',
          icon: <BarChart3 className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />,
        },
        {
          label: t('navigation.invoicing'),
          href: '/invoicing',
          description: 'Create and manage invoices',
          icon: <FileText className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />,
        },
        {
          label: t('navigation.payments'),
          href: '/payments',
          description: 'Track and process payments',
          icon: <CreditCard className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />,
        },
        {
          label: t('navigation.team'),
          href: '/team',
          description: 'Manage your team members',
          icon: <Users className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />,
        },
      ],
    },
    {
      label: t('navigation.resources'),
      dropdown: [
        {
          label: t('navigation.documentation'),
          href: '/docs',
          description: 'Guides and API references',
          icon: <BookOpen className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />,
        },
        {
          label: t('navigation.help'),
          href: '/help',
          description: 'Get support and answers',
          icon: <HelpCircle className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />,
        },
        {
          label: t('navigation.themeShowcase'),
          href: '/theme-showcase',
          description: 'Explore our design system',
          icon: <Settings className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />,
        },
        {
          label: t('navigation.examples'),
          href: '/example',
          description: 'See our components in action',
          icon: <Zap className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />,
        },
      ],
    },
    {
      label: t('navigation.pricing'),
      href: '/pricing',
    },
    {
      label: t('navigation.dashboard'),
      href: '/example-chat',
    },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'shadow-md' : ''
      }`}
      style={{
        backgroundColor: scrolled ? 'var(--bg-primary)' : 'var(--bg-primary)',
        borderBottom: `1px solid ${scrolled ? 'var(--border-color)' : 'transparent'}`,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <img src="/logo.png" alt="IWEApp Logo" className="w-38 h-38" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.dropdown && handleMouseEnter(item.label)}
                onMouseLeave={handleMouseLeave}
              >
                {item.dropdown ? (
                  <>
                    <button
                      className="px-4 py-2 rounded-lg font-medium flex items-center gap-1 transition-all"
                      style={{
                        color: activeDropdown === item.label ? 'var(--accent-primary)' : 'var(--text-primary)',
                      }}
                    >
                      {item.label}
                      <motion.div
                        animate={{ rotate: activeDropdown === item.label ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {activeDropdown === item.label && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2, ease: 'easeOut' }}
                          className="absolute top-full left-0 mt-2 w-80 rounded-xl shadow-2xl overflow-hidden"
                          style={{
                            backgroundColor: 'var(--bg-primary)',
                            border: '1px solid var(--border-color)',
                          }}
                        >
                          <div className="p-2">
                            {item.dropdown.map((dropdownItem, index) => (
                              <Link
                                key={dropdownItem.href}
                                href={dropdownItem.href}
                                onClick={() => setActiveDropdown(null)}
                              >
                                <motion.div
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                  className="flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all"
                                  whileHover={{ 
                                    x: 4,
                                    backgroundColor: 'var(--bg-secondary)'
                                  }}
                                >
                                  <div
                                    className="p-2 rounded-lg flex-shrink-0"
                                    style={{ backgroundColor: 'var(--bg-tertiary)' }}
                                  >
                                    <div style={{ color: 'var(--accent-primary)' }}>
                                      {dropdownItem.icon}
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-sm mb-1">
                                      {dropdownItem.label}
                                    </div>
                                    {dropdownItem.description && (
                                      <div
                                        className="text-xs"
                                        style={{ color: 'var(--text-secondary)' }}
                                      >
                                        {dropdownItem.description}
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <Link href={item.href || '#'}>
                    <motion.div
                      className="px-4 py-2 rounded-lg font-medium transition-all"
                      whileHover={{ backgroundColor: 'var(--bg-secondary)' }}
                    >
                      {item.label}
                    </motion.div>
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeToggle />
            <Link href="/login">
              <motion.div
                className="px-4 py-2 rounded-lg font-medium transition-all cursor-pointer"
                style={{ color: 'var(--text-primary)' }}
                whileHover={{ backgroundColor: 'var(--bg-secondary)' }}
                whileTap={{ scale: 0.95 }}
              >
                {t('navigation.login')}
              </motion.div>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            <ThemeToggle />
            <motion.button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg"
              whileTap={{ scale: 0.95 }}
              style={{ backgroundColor: 'var(--bg-secondary)' }}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderTop: '1px solid var(--border-color)',
            }}
          >
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <div key={item.label}>
                  {item.dropdown ? (
                    <div>
                      <button
                        onClick={() =>
                          setActiveDropdown(
                            activeDropdown === item.label ? null : item.label
                          )
                        }
                        className="w-full flex items-center justify-between p-3 rounded-lg font-medium"
                        style={{ backgroundColor: 'var(--bg-secondary)' }}
                      >
                        {item.label}
                        <motion.div
                          animate={{
                            rotate: activeDropdown === item.label ? 180 : 0,
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </motion.div>
                      </button>
                      <AnimatePresence>
                        {activeDropdown === item.label && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-2 space-y-1 pl-4"
                          >
                            {item.dropdown.map((dropdownItem) => (
                              <Link
                                key={dropdownItem.href}
                                href={dropdownItem.href}
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                <div
                                  className="flex items-start gap-3 p-3 rounded-lg"
                                  style={{ backgroundColor: 'var(--bg-tertiary)' }}
                                >
                                  <div style={{ color: 'var(--accent-primary)' }}>
                                    {dropdownItem.icon}
                                  </div>
                                  <div>
                                    <div className="font-semibold text-sm">
                                      {dropdownItem.label}
                                    </div>
                                    {dropdownItem.description && (
                                      <div
                                        className="text-xs mt-1"
                                        style={{ color: 'var(--text-secondary)' }}
                                      >
                                        {dropdownItem.description}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link href={item.href || '#'} onClick={() => setMobileMenuOpen(false)}>
                      <div
                        className="p-3 rounded-lg font-medium"
                        style={{ backgroundColor: 'var(--bg-secondary)' }}
                      >
                        {item.label}
                      </div>
                    </Link>
                  )}
                </div>
              ))}

              {/* Mobile Auth Buttons */}
              <div className="pt-4 space-y-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <div className="px-4 pb-2">
                  <LanguageSwitcher />
                </div>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <div
                    className="w-full p-3 rounded-lg font-medium cursor-pointer"
                    style={{ backgroundColor: 'var(--bg-secondary)' }}
                  >
                    {t('navigation.login')}
                  </div>
                </Link>
                <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <div className="btn-primary w-full cursor-pointer">
                    {t('navigation.signup')}
                  </div>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
