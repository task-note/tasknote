import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import FsBackend, { FsBackendOptions } from 'i18next-fs-backend';
import path from 'path';

function getLocalePath() {
  const curr = __dirname;
  if (curr.indexOf('asar') > 0) {
    return path.join(curr, '../../../src/locales/');
  }
  return path.join(curr, '../locales/');
}

const i18n_config = {
  backend: {
    loadPath: path.join(getLocalePath(), '{{lng}}/{{ns}}.json'),
    addPath: path.join(getLocalePath(), '{{lng}}/{{ns}}.missing.json'),
  },

  // other options you might configure
  debug: true,
  saveMissing: true,
  saveMissingTo: 'current',
  fallbackLng: 'en',
  supportedLngs: ['cn', 'en'],
  lng: 'cn',
};

i18n.use(FsBackend).use(initReactI18next).init<FsBackendOptions>(i18n_config);

export { i18n as default, i18n_config };
