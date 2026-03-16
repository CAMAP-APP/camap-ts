import { BreakpointsOptions, createTheme, PaletteColorOptions, ThemeOptions } from '@mui/material';
import { frFR } from '@mui/material/locale';
import { palette } from './palette';
declare module '@mui/material/styles' {
  interface BreakpointOverrides {
    xs: true;
    phone: true;
    sm: true;
    md: true;
    lg: true;
    xl: true;
    xxl: true;
  }
}

declare module '@mui/material/styles' {
  interface PaletteOptions {
    lightgrey: PaletteColorOptions | undefined;
  }
}
declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    lightgrey: true;
  }
}

export const themeOptions: ThemeOptions = {
  palette: {
    ...palette,
    lightgrey: {
      main: "#e7e7e7",
      light: "#ebebeb",
      dark: "#e0e0e0",
      contrastText: "#404040"
    }
  },
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
        containedPrimary: {
          '&:hover': {
            color: '#FFF',
          },
          '&.Mui-focusVisible': {
            color: '#FFF',
            outline: 0,
            textDecoration: 'none',
          },
        },
        outlinedPrimary: {
          '&:hover': {
            color: palette.primary.main,
          },
          '&.Mui-focusVisible': {
            color: palette.primary.main,
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
  breakpoints: { // bootstrap breakpoints
    values: {
      xs: 0,
      phone: 320,
      sm: 576,
      md: 768,
      lg: 992,
      xl: 1200,
      xxl: 1400
    }
  } as any as BreakpointsOptions // I followed the doc about correct typing but it does not work
};

export default createTheme(themeOptions, frFR);
