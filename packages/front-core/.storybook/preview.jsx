import ThemeProvider from '@mui/material/styles/ThemeProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import frLocale from 'date-fns/locale/fr';
import React from 'react';
import '../src/lib/i18n';
import theme from '../src/theme';

class LocalizedUtils extends AdapterDateFns {
  getDatePickerHeaderText(date) {
    return this.format(date, 'd MMM yyyy', { locale: this.locale });
  }
}

export const parameters = {
  actions: {
    argTypesRegex: '^on[A-Z].*',
  },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};

export const decorators = [
  (Story) => (
    <React.Suspense fallback="Loading...">
      <ThemeProvider theme={theme}>
        <LocalizationProvider
          dateAdapter={LocalizedUtils}
          adapterLocale={frLocale}
        >
          <Story />
        </LocalizationProvider>
      </ThemeProvider>
    </React.Suspense>
  ),
];
