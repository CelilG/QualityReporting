import { createTheme } from "@mui/material/styles";

export const colors = {
  primary: "#1565C0",
  background: "#F5F7FA",
  surface: "#FFFFFF",
  textPrimary: "#1F2937",
  textSecondary: "#6B7280",
  success: "#2E7D32",
  warning: "#ED6C02",
  error: "#D32F2F",
};

export const theme = createTheme({
  palette: {
    primary: {
      main: colors.primary,
    },

    background: {
      default: colors.background,
      paper: colors.surface,
    },

    text: {
      primary: colors.textPrimary,
      secondary: colors.textSecondary,
    },

    success: {
      main: colors.success,
    },

    warning: {
      main: colors.warning,
    },

    error: {
      main: colors.error,
    },
  },

  typography: {
    fontFamily: "Arial, sans-serif",

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
      fontWeight: 600,
      textTransform: "none",
    },
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          minHeight: 42,
          paddingLeft: 20,
          paddingRight: 20,
          fontWeight: 600,
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
        },
      },
    },

    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});