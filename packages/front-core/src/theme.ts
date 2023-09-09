import { createTheme, ThemeOptions } from '@mui/material';
import { frFR } from '@mui/material/locale';
import { palette } from './palette';

export const themeOptions: ThemeOptions = {
  palette,
  typography: {
    fontSize: 16,
    fontFamily: 'Cabin, Arial, Helvetica, sans-serif',
    button: {
      textTransform: 'none',
    },
    h1: {
      fontSize: '2.5625rem',
    },
    h2: {
      fontSize: '2.125rem',
    },
    h3: {
      fontSize: '1.75rem',
    },
    h4: {
      fontSize: '1.25rem',
    },
    h5: {
      fontSize: '1.125rem',
    },
    h6: {
      fontSize: '1rem',
    },
    body1: {
      fontSize: '1rem',
    },
    body2: {
      fontSize: '0.875rem',
    },
  },
  components: {
    MuiAlert: {
      defaultProps: {
        variant: 'filled',
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          color: '#ffffff',
          fontSize: '0.85rem',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        // Overrides Bootstrap
        contained: {
          '&:hover': {
            color: '#FFF',
          },
          '&:focus': {
            color: '#FFF',
            outline: 0,
            textDecoration: 'none',
          },
        },
        outlinedPrimary: {
          '&:hover': {
            color: palette.primary!.main,
          },
          '&:focus': {
            color: palette.primary!.main,
            outline: 0,
            textDecoration: 'none',
          },
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          border: 0,
          marginBottom: 0,
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: ({ ownerState }) => {
          if (!ownerState.hiddenLabel) return;
          return {
            '& > fieldset > legend': {
              width: 0,
            },
          };
        },
      },
    },
    MuiPopover: {
      defaultProps: {
        disableScrollLock: true,
      },
    },
    MuiModal: {
      defaultProps: {
        disableScrollLock: true,
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: '1.25rem',
          fontWeight: 700,
          letterSpacing: '0.0075em',
        },
      },
    },
  },
};

export default createTheme(themeOptions, frFR);
