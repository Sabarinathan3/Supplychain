import { createTheme } from '@mui/material/styles';

const getTheme = (mode) => createTheme({
  palette: {
    mode: mode, // This enables light/dark mode switching
    primary: {
      main: '#667eea',
      light: '#8b9cef',
      dark: '#4c63d2',
      contrastText: '#fff',
    },
    secondary: {
      main: '#764ba2',
      light: '#9168b8',
      dark: '#5a3a7e',
      contrastText: '#fff',
    },
    success: {
      main: '#4caf50',
      light: '#6fbf73',
      dark: '#357a38',
    },
    error: {
      main: '#f44336',
      light: '#f6685e',
      dark: '#aa2e25',
    },
    warning: {
      main: '#ff9800',
      light: '#ffac33',
      dark: '#b26a00',
    },
    info: {
      main: '#2196f3',
      light: '#4dabf5',
      dark: '#1769aa',
    },
    background: {
      default: mode === 'light' ? '#f5f5f5' : '#121212',
      paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

export default getTheme;
