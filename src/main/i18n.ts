import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import FsBackend, { FsBackendOptions } from 'i18next-fs-backend';

i18n
  .use(FsBackend)
  .use(initReactI18next)
  .init<FsBackendOptions>({
    backend: {
      loadPath: 'src/locales/{{lng}}/{{ns}}.json',
      addPath: 'src/locales/{{lng}}/{{ns}}.missing.json',
    },

    // other options you might configure
    debug: true,
    saveMissing: true,
    saveMissingTo: 'current',
    fallbackLng: 'en',
    supportedLngs: ['cn', 'en'],
    lng: 'cn',
  });

export default i18n;
