import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import i18n from '@/lib/i18n';
import { I18nManager, Platform } from 'react-native';

type SupportedLanguage = 'en' | 'he';

interface LanguageState {
  language: SupportedLanguage;
  isRTL: boolean;
  setLanguage: (lang: SupportedLanguage) => void;
  initialize: () => void;
  toggleLanguage: () => void;
}

const RTL_LANGUAGES: SupportedLanguage[] = ['he'];

const getStorageAdapter = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return localStorage;
  }
  // Fallback for non-web environments
  return {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  };
};

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'he', // Default to Hebrew for Israeli market
      isRTL: true,

      setLanguage: (lang: SupportedLanguage) => {
        const isRTL = RTL_LANGUAGES.includes(lang);
        i18n.changeLanguage(lang);

        if (Platform.OS !== 'web') {
          I18nManager.allowRTL(isRTL);
          I18nManager.forceRTL(isRTL);
        }

        set({ language: lang, isRTL });
      },

      initialize: () => {
        const { language } = get();
        i18n.changeLanguage(language);
        const isRTL = RTL_LANGUAGES.includes(language);

        if (Platform.OS !== 'web') {
          I18nManager.allowRTL(isRTL);
          I18nManager.forceRTL(isRTL);
        }

        set({ isRTL });
      },

      toggleLanguage: () => {
        const { language, setLanguage } = get();
        const newLang: SupportedLanguage = language === 'he' ? 'en' : 'he';
        setLanguage(newLang);
      },
    }),
    {
      name: 'ori-solar-language',
      storage: createJSONStorage(() => getStorageAdapter()),
    }
  )
);

export const useIsRTL = () => useLanguageStore((state) => state.isRTL);
export const useCurrentLanguage = () => useLanguageStore((state) => state.language);
