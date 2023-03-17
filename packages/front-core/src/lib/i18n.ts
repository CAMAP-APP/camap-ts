import i18n from 'i18next';
import ChainedBackend from 'i18next-chained-backend';
import HttpBackend from 'i18next-http-backend';
import LocalStorageBackend from 'i18next-localstorage-backend';
import { initReactI18next } from 'react-i18next';

i18n
  .use(ChainedBackend)
  .use(initReactI18next)
  .init({
    lng: 'fr',
    fallbackLng: 'fr',
    debug: process.env.NODE_ENV !== 'production' && false,

    backend: {
      backends: [LocalStorageBackend, HttpBackend],
      backendOptions: [
        {
          expirationTime: 30 * 24 * 60 * 60 * 1000, // 30 days
          defaultVersion: 'v1.9',
        },
        {
          loadPath: `${process.env.FRONT_URL}/locales/{{lng}}/{{ns}}.json`,
        },
      ],
    },

    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
      defaultVariables: {
        theme: window._Camap.theme,
      },
    },
  });

export default i18n;
