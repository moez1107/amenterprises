import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { fallbackLng } from './config';
import en from '../locales/en/translation.json';
import ar from '../locales/ar/translation.json';
import de from '../locales/de/translation.json';
import fr from '../locales/fr/translation.json';
import tr from '../locales/tr/translation.json';
import zh from '../locales/zh/translation.json';
import ja from '../locales/ja/translation.json';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
    de: { translation: de },
    fr: { translation: fr },
    tr: { translation: tr },
    zh: { translation: zh },
    ja: { translation: ja },
  },
  lng: localStorage.getItem('i18nextLng') || fallbackLng,
  fallbackLng,
  interpolation: { escapeValue: false },
});

// Set initial direction
const savedLng = localStorage.getItem('i18nextLng') || fallbackLng;
document.documentElement.dir = savedLng === 'ar' ? 'rtl' : 'ltr';
document.documentElement.lang = savedLng;

export default i18n;
