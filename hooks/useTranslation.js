import { useTranslation as useNextTranslation } from 'next-i18next';

export const useTranslation = (namespace = 'common') => {
  const { t, i18n } = useNextTranslation(namespace);
  
  return {
    t,
    i18n,
    currentLanguage: i18n.language,
    changeLanguage: i18n.changeLanguage,
    isRTL: ['ar'].includes(i18n.language),
  };
};
