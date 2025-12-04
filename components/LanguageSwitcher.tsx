import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Globe, ChevronDown } from 'lucide-react';

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'yo', name: 'Yorùbá', flag: '🇳🇬' },
  { code: 'ig', name: 'Igbo', flag: '🇳🇬' },
  { code: 'ha', name: 'Hausa', flag: '🇳🇬' },
  { code: 'pcm', name: 'Nigerian Pidgin', flag: '🇳🇬' },
];

export default function LanguageSwitcher() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  
  const currentLanguage = languages.find(lang => lang.code === router.locale) || languages[0];

  const handleLanguageChange = (languageCode: string) => {
    const { pathname, asPath, query } = router;
    router.push({ pathname, query }, asPath, { locale: languageCode });
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Globe className="w-4 h-4" style={{ color: 'var(--text-primary)' }} />
        <span className="text-sm font-medium">{currentLanguage.flag}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-primary)' }} />
        </motion.div>
      </motion.button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full right-0 mt-2 w-48 rounded-xl shadow-2xl overflow-hidden z-50"
          style={{
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
          }}
        >
          <div className="p-2">
            {languages.map((language) => (
              <motion.button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className="w-full flex items-center gap-3 p-2 rounded-lg text-left transition-all"
                whileHover={{ 
                  x: 4,
                  backgroundColor: 'var(--bg-secondary)'
                }}
              >
                <span className="text-lg">{language.flag}</span>
                <div>
                  <div className="font-medium text-sm">{language.name}</div>
                  <div 
                    className="text-xs"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {language.code.toUpperCase()}
                  </div>
                </div>
                {router.locale === language.code && (
                  <div 
                    className="w-2 h-2 rounded-full ml-auto"
                    style={{ backgroundColor: 'var(--accent-primary)' }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
