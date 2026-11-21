import { Box, Card, Container, Stack, Typography } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

const POINTS = [
  "Yaxınlığınızdakı ustaları xəritədə görün",
  "Ustaya birbaşa, vasitəçisiz yazın",
  "Ustalar üçün pulsuz profil və portfolio",
];

// Giriş/qeydiyyat səhifələrinin ortaq çərçivəsi: solda forma, böyük ekranda sağda qısa təqdimat
export default function AuthShell({ title, subtitle, children, maxWidth = "md", wide = false }) {
  return (
    <Container maxWidth={maxWidth} sx={{ py: { xs: 4, md: 7 } }}>
      <Card sx={{ display: "flex", overflow: "hidden" }}>
        <Box sx={{ flex: 1, p: { xs: 3, sm: 5 }, minWidth: 0 }}>
          <Typography variant="h4">{title}</Typography>
          {subtitle && <Typography color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>{subtitle}</Typography>}
          {children}
        </Box>
        {!wide && (
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              width: 320,
              flexShrink: 0,
              flexDirection: "column",
              justifyContent: "center",
              p: 4,
              color: "#fff",
              background: "linear-gradient(160deg, #0F766E 0%, #115E59 100%)",
            }}
          >
            <Typography variant="h5" sx={{ mb: 3 }}>Usta.az ilə işiniz asanlaşır</Typography>
            <Stack spacing={2}>
              {POINTS.map((p) => (
                <Stack key={p} direction="row" spacing={1.5} alignItems="flex-start">
                  <CheckCircleOutlineIcon sx={{ color: "secondary.light" }} />
                  <Typography sx={{ opacity: 0.9 }}>{p}</Typography>
                </Stack>
              ))}
            </Stack>
          </Box>
        )}
      </Card>
    </Container>
  );
}
