import React from 'react';
import i18n from 'i18next';
import { initReactI18next, I18nextProvider } from 'react-i18next';
import HttpApi from 'i18next-http-backend';

i18n
  .use(HttpApi)
  .use(initReactI18next)
  .init({
    fallbackLng: 'no',
    lng: 'no',

    debug: false,

    react: {
      useSuspense: false,
    },

    // backend: {
    //   loadPath: '/locales/{{ns}}_{{lng}}.json',
    // },

    interpolation: {
      escapeValue: false, // not needed for react!!
    },
  });

function withTestI18nMocker<T>(Component: React.ComponentType<T>) {
  const Wrapper: React.FC<T> = (props: T) => {
    return (
      <I18nextProvider i18n={i18n}>
        <Component {...props} />
      </I18nextProvider>
    );
  };

  Wrapper.displayName = 'withTestI18nMocker';

  return Wrapper;
}

export default withTestI18nMocker;
