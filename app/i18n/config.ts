export const supportedLanguages = [
  { code: 'en', name: 'English', flag: '🇺🇸', dir: 'ltr' as const },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', dir: 'rtl' as const },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', dir: 'ltr' as const },
  { code: 'fr', name: 'Français', flag: '🇫🇷', dir: 'ltr' as const },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷', dir: 'ltr' as const },
  { code: 'zh', name: '中文', flag: '🇨🇳', dir: 'ltr' as const },
  { code: 'ja', name: '日本語', flag: '🇯🇵', dir: 'ltr' as const },
] as const;

export type LanguageCode = typeof supportedLanguages[number]['code'];

export const fallbackLng = 'en';
