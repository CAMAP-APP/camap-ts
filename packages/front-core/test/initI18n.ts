// // import i18n, { i18nPromise } from '../src/lib/i18n';

// import i18n from 'i18next';
// import Backend from 'i18next-xhr-backend';
// import { initReactI18next } from 'react-i18next';

// export const i18nPromise = i18n
//   .use(Backend)
//   .use(initReactI18next)
//   .init({
//     lng: 'fr',
//     fallbackLng: 'fr',
//     debug: process.env.NODE_ENV !== 'production' && false,

//     interpolation: {
//       escapeValue: false, // not needed for react as it escapes by default
//     },

//     react: {
//       useSuspense: false,
//     },
//   });

// const initI18n = (namespaces: string | string[]) => {
//   return i18nPromise.then((res) => {
//     return i18n.loadNamespaces(namespaces).then(() => {
//       return res;
//     });
//   });
// };

// export default initI18n;

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  fallbackLng: 'en',
  lng: 'en',

  debug: false,

  resources: {
    en: {},
    de: {},
  },

  interpolation: {
    escapeValue: false, // not needed for react!!
  },
});

export default i18n;
