import { createTheme } from "@mui/material/styles";

// Rəng palitrası: etibar üçün teal (əsas), diqqət üçün amber (vurğu), neytral slate fon.
// Gündüz və gecə rejimi CSS dəyişənləri ilə işləyir; "surface.*" hər iki rejimdə uyğun fonlardır.
const secondary = { main: "#F59E0B", light: "#FCD34D", dark: "#B45309", contrastText: "#1F2937" };

const light = {
  secondary,
  primary: { main: "#0F766E", light: "#14B8A6", dark: "#115E59", contrastText: "#FFFFFF" },
  success: { main: "#16A34A" },
  error: { main: "#DC2626" },
  background: { default: "#F6F8FA", paper: "#FFFFFF" },
  text: { primary: "#0F172A", secondary: "#64748B" },
  divider: "#E2E8F0",
  surface: { subtle: "#F1F5F9", tint: "#ECFDF5", warm: "#FFFBEB", danger: "#FEF2F2", muted: "#E2E8F0", glass: "rgba(255,255,255,.9)", veil: "rgba(241,245,249,.72)" },
};

const dark = {
  secondary,
  primary: { main: "#2DD4BF", light: "#5EEAD4", dark: "#0F766E", contrastText: "#042F2E" },
  success: { main: "#4ADE80" },
  error: { main: "#F87171" },
  background: { default: "#0B1220", paper: "#131C2E" },
  text: { primary: "#E8EEF6", secondary: "#9FB0C6" },
  divider: "#263349",
  surface: { subtle: "#1B2740", tint: "#10312F", warm: "#33280F", danger: "#3A1A1F", muted: "#334155", glass: "rgba(15,23,38,.9)", veil: "rgba(8,14,26,.72)" },
};

const theme = createTheme({
  cssVariables: { colorSchemeSelector: "data-mui-color-scheme" },
  colorSchemes: { light: { palette: light }, dark: { palette: dark } },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    h1: { fontWeight: 800, letterSpacing: "-0.02em" },
    h2: { fontWeight: 800, letterSpacing: "-0.02em" },
    h3: { fontWeight: 700, letterSpacing: "-0.01em" },
    h4: { fontWeight: 800, letterSpacing: "-0.015em" },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        "::selection": { backgroundColor: "rgba(20,184,166,.25)" },
        // Hərəkəti azaltmağı seçən istifadəçilər üçün
        "@media (prefers-reduced-motion: reduce)": { "*, *::before, *::after": { animationDuration: ".01ms !important", transitionDuration: ".01ms !important", scrollBehavior: "auto !important" } },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 10, paddingInline: 18, transition: "background-color .15s, transform .12s, border-color .15s", "&:active": { transform: "scale(.98)" } },
        sizeLarge: { paddingBlock: 12, fontSize: "1rem" },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: { root: ({ theme: t }) => ({ border: `1px solid ${t.vars.palette.divider}`, borderRadius: 16, transition: "border-color .15s, box-shadow .2s, transform .15s" }) },
    },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" }, rounded: { borderRadius: 16 } } },
    MuiTextField: { defaultProps: { fullWidth: true } },
    MuiOutlinedInput: { styleOverrides: { root: ({ theme: t }) => ({ borderRadius: 10, backgroundColor: t.vars.palette.background.paper }) } },
    MuiChip: { styleOverrides: { root: { fontWeight: 500 } } },
    MuiTab: { styleOverrides: { root: { textTransform: "none", fontWeight: 600 } } },
    MuiAppBar: { defaultProps: { elevation: 0, color: "inherit" } },
  },
});

export default theme;
