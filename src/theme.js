import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#662d91', // Violet principal ACER ZNO
      light: '#9e005d', // Magenta ACER ZNO
      dark: '#1b1464', // Bleu marine ACER ZNO
      special: 'rgba(102, 45, 145, 0.16)',
      specialHover: 'rgba(102, 45, 145, 0.32)',
    },
    secondary: {
      main: '#2a3184', // Bleu foncé ACER ZNO
    },
    success: {
      main: '#4CAF50', // Vert pour les indicateurs de lecture
      light: '#81C784',
      dark: '#388E3C',
    },
    error: {
      main: '#F44336', // Rouge pour les erreurs
      light: '#EF5350',
      dark: '#D32F2F',
    },
    background: {
      default: '#FFFFFF',
      paper: '#f4f4f4',
    },
  },
  typography: {
    fontFamily: '"FUTURA", "Open Sans", "Helvetica", "Arial", sans-serif', // Police de soutien ACER ZNO
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      color: '#1a1a1a',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#1a1a1a',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      color: '#1a1a1a',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#1a1a1a',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#1a1a1a',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      color: '#1a1a1a',
    },
    body1: {
      fontSize: '1rem',
      color: '#333333',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          userSelect: 'text !important',
          WebkitUserSelect: 'text !important',
          MozUserSelect: 'text !important',
          msUserSelect: 'text !important',
        },
        '::selection': {
          backgroundColor: 'rgba(102, 45, 145, 0.2) !important',
          color: '#000000 !important',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 4,
          padding: '8px 16px',
          fontWeight: 600,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0px 2px 4px rgba(0,0,0,0.05)',
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 3px rgba(0,0,0,0.05)',
        },
      },
    },
  },
});

export default theme;

