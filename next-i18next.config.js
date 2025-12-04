module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'yo', 'ig', 'ha', 'pcm'],
    localePath: './locales',
    localeDetection: true,
  },
  reloadOnPrerender: process.env.NODE_ENV === 'development',
};
