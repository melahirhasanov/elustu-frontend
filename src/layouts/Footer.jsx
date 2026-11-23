import { Box, Container, Link, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { Logo } from "./Header";

const LINKS = [
  { label: "Usta tap", to: "/tap" },
  { label: "Ustalar", to: "/ustalar" },
  { label: "Necə işləyir?", to: "/#nece-isleyir" },
  { label: "Usta kimi qoşul", to: "/qeydiyyat?rol=usta" },
  { label: "Daxil ol", to: "/giris" },
];

export default function Footer() {
  return (
    <Box component="footer" sx={{ borderTop: 1, borderColor: "divider", bgcolor: "background.paper", mt: "auto" }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={3} justifyContent="space-between" alignItems={{ md: "center" }}>
          <Box>
            <Logo />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, maxWidth: 360 }}>
              Yaxınlığınızdakı peşəkar ustanı tapın, birbaşa yazışın və işinizi rahat həll edin.
            </Typography>
          </Box>
          <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
            {LINKS.map((l) => (
              <Link key={l.label} component={RouterLink} to={l.to} underline="hover" color="text.secondary" variant="body2">
                {l.label}
              </Link>
            ))}
          </Stack>
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 3 }}>
          © {new Date().getFullYear()} Əlüstü
        </Typography>
      </Container>
    </Box>
  );
}
