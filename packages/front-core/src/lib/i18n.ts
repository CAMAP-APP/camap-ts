import i18n from 'i18next';
import ChainedBackend from 'i18next-chained-backend';
import HttpBackend from 'i18next-http-backend';
import LocalStorageBackend from 'i18next-localstorage-backend';
import { initReactI18next } from 'react-i18next';
import { getLocalesLoadPath } from './runtimeCfg';

i18n
  .use(ChainedBackend)
  .use(initReactI18next)
  .init({
    lng: 'fr',
    fallbackLng: 'fr',
    debug: process.env.NODE_ENV !== 'production' && false,

    backend: {
      // 1) LocalStorage (cache) -> 2) HTTP (runtime via env.js ou fallback /locales)
      backends: [LocalStorageBackend, HttpBackend],
      backendOptions: [
        {
          expirationTime: 1 * 24 * 60 * 60 * 1000, // 1 jour
          defaultVersion: 'v1.9',
        },
        {
          // IMPORTANT : runtime (FRONT_URL depuis env.js) ou fallback relatif /locales
          loadPath: getLocalesLoadPath(),
        },
      ],
    },

    interpolation: {
      escapeValue: false, // react échappe déjà
      defaultVariables: {
        // évite l'erreur si _Camap ou theme n'existent pas encore
        theme: (window as any)?._Camap?.theme,
      },
    },
  });

export default i18n;
