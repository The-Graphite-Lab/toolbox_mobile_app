import { createTheme } from '@mui/material/styles'

const baseTheme = createTheme({
  palette: {
    primary: {
      main: '#e96600',
      contrastText: '#fffefc',
    },
    secondary: {
      main: '#242965',
      contrastText: '#fffefc',
    },
    error: {
      main: '#cb2d2d',
      contrastText: '#fffefc',
    },
    warning: {
      main: '#fec42a',
      contrastText: '#3a3b38',
    },
    info: {
      main: '#4692df',
      contrastText: '#fffefc',
    },
    success: {
      main: '#319a49',
      contrastText: '#fffefc',
    },
    neutral: {
      main: '#3a3b38',
      light: '#e1e1e1',
      dark: '#1f201e',
      contrastText: '#fffefc',
    },
    background: {
      default: '#fffefc',
      paper: '#ffffff',
    },
    text: {
      primary: '#3a3b38',
      secondary: 'rgba(58, 59, 56, 0.7)',
    },
    divider: '#e1e1e1',
  },
  typography: {
    fontFamily:
      '"brother-1816", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
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
    subtitle1: {
      fontWeight: 600,
    },
    subtitle2: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
})

const theme = createTheme(baseTheme, {
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: baseTheme.palette.background.default,
          color: baseTheme.palette.text.primary,
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
        variant: 'contained',
        color: 'warning',
      },
      styleOverrides: {
        root: {
          borderRadius: 999,
          paddingLeft: baseTheme.spacing(3),
          paddingRight: baseTheme.spacing(3),
        },
        contained: {
          backgroundColor: baseTheme.palette.warning.main,
          color: baseTheme.palette.warning.contrastText,
          '&:hover': {
            backgroundColor: baseTheme.palette.warning.main,
          },
        },
        outlined: {
          borderColor: baseTheme.palette.warning.main,
          color: baseTheme.palette.warning.main,
          '&:hover': {
            borderColor: baseTheme.palette.warning.main,
            backgroundColor: 'rgba(252, 181, 0, 0.08)',
          },
        },
        text: {
          color: baseTheme.palette.warning.main,
          '&:hover': {
            backgroundColor: 'rgba(252, 181, 0, 0.08)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: `1px solid ${baseTheme.palette.divider}`,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 600,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        fullWidth: true,
      },
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          fontSize: '16px',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: baseTheme.palette.secondary.main,
          fontWeight: 600,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontSize: baseTheme.typography.pxToRem(12),
          borderRadius: 8,
        },
      },
    },
  },
})

export default theme
