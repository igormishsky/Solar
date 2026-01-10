import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from './locales/en.json';
import he from './locales/he.json';

const resources = {
  en: { translation: en },
  he: { translation: he },
};

// Get device locale, default to Hebrew for Israeli market
const locales = Localization.getLocales();
const deviceLocale = locales?.[0]?.languageCode || 'he';
const defaultLanguage = ['en', 'he'].includes(deviceLocale) ? deviceLocale : 'he';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: defaultLanguage,
    fallbackLng: 'he',
    interpolation: {
      escapeValue: false,
    },
    compatibilityJSON: 'v4',
  });

export default i18n;
