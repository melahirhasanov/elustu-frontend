import { createTheme, alpha } from "@mui/material/styles";

// Rəng palitrası: etibar üçün teal (əsas), diqqət üçün amber (vurğu), neytral slate fon
const palette = {
  primary: { main: "#0F766E", light: "#14B8A6", dark: "#115E59", contrastText: "#FFFFFF" },
  secondary: { main: "#F59E0B", light: "#FCD34D", dark: "#B45309", contrastText: "#1F2937" },
  success: { main: "#16A34A" },
  error: { main: "#DC2626" },
  background: { default: "#F6F8FA", paper: "#FFFFFF" },
  text: { primary: "#0F172A", secondary: "#64748B" },
  divider: "#E2E8F0",
};

const theme = createTheme({
  palette,
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    h1: { fontWeight: 800, letterSpacing: "-0.02em" },
    h2: { fontWeight: 800, letterSpacing: "-0.02em" },
    h3: { fontWeight: 700, letterSpacing: "-0.01em" },
    h4: { fontWeight: 700, letterSpacing: "-0.01em" },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: palette.background.default },
        "::selection": { background: alpha(palette.primary.light, 0.25) },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 10, paddingInline: 18 },
        sizeLarge: { paddingBlock: 12, fontSize: "1rem" },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { border: `1px solid ${palette.divider}`, borderRadius: 16 },
      },
    },
    MuiPaper: {
      styleOverrides: { rounded: { borderRadius: 16 } },
    },
    MuiTextField: { defaultProps: { fullWidth: true } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 10, backgroundColor: "#fff" },
      },
    },
    MuiChip: { styleOverrides: { root: { fontWeight: 500 } } },
    MuiTab: { styleOverrides: { root: { textTransform: "none", fontWeight: 600 } } },
    MuiAppBar: { defaultProps: { elevation: 0, color: "inherit" } },
  },
});

export default theme;
