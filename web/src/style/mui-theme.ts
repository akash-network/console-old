import { createTheme } from '@mui/material/styles';

export const muiTheme = createTheme({
  components: {
    MuiButton: {
      styleOverrides: {
        contained: {
          color: '#FFFFFF',
          backgroundColor: '#FA5757',
          boxShadow: '0px 1px 2px 0px #0000000D',
          borderRadius: '6px',
          textTransform: 'none',
          '&:hover': {
            backgroundColor: '#ED4E4E',
          },
        },
        outlined: {
          color: '#374151',
          backgroundColor: '#FFFFFF',
          boxShadow: '0px 1px 2px 0px #0000000D',
          borderRadius: '6px',
          border: '1px solid #D1D5DB',
          textTransform: 'none',
          '&:hover': {
            backgroundColor: '#F4F5F8',
            border: '1px solid #D1D5DB',
          },
        },
        outlinedSecondary: {
          textAlign: 'left',
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          backgroundColor: '#f9fafb',
        },
      },
    },
  },
  typography: {
    fontFamily: 'Satoshi-Variable',

    h1: {
      fontWeight: '400',
      fontSize: '14px',
      lineHeight: '20px',
    },

    h2: {
      fontWeight: '400',
      fontSize: '14px',
      lineHeight: '20px',
    },

    h3: {
      fontWeight: '500',
      fontSize: '14px',
      lineHeight: '20px',
      margin: '0.25rem 0',
    },

    body1: {
      fontWeight: '400',
      fontSize: '14px',
      lineHeight: '20px',
      color: '#3D4148',
    },

    body2: {
      fontWeight: '400',
      fontSize: '14px',
      lineHeight: '20px',
      color: '#6B7280',
    },
  },
  palette: {
    success: {
      main: '#D1FAE5',
      contrastText: '#065F46',
    },
    primary: {
      main: '#FA5757',
      dark: '#ff7981',
      light: '#860a25',
      contrastText: '#fff',
    },
    secondary: {
      main: '#c088cf',
      dark: '#b65fcd',
      light: '#FEE2E2',
      contrastText: '#000',
    },
    info: {
      main: '#f3f81f',
      dark: '#f5f863',
      light: '#fcfdcc',
    },
  },
});
