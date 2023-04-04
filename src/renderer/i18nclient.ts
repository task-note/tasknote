import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

export interface LanguageMessage {
  language: string;
  namespace: string;
  resource: any;
}

i18n.use(initReactI18next);
if (!i18n.isInitialized) {
  i18n.init({
    // other options you might configure
    debug: true,
    saveMissing: true,
    saveMissingTo: 'current',
    fallbackLng: 'en',
    supportedLngs: ['cn', 'en'],
    lng: 'cn',
  });
}

export default i18n;
