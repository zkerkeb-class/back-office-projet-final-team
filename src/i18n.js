import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  fr: {
    translation: require('./locales/fr/translation.json'),
  },
  en: {
    translation: require('./locales/en/translation.json'),
  },
  ar: {
    translation: require('./locales/ar/translation.json'),
  },
};

// Création d'une instance i18n côté serveur
const initI18next = async () => {
  await i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: 'fr',
      supportedLngs: ['fr', 'en', 'ar'],
      interpolation: {
        escapeValue: false,
      },
      detection: {
        order: ['cookie', 'localStorage', 'navigator'],
        caches: ['cookie'],
      },
    });

  return i18n;
};

export default initI18next;
